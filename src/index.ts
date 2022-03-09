// Import libs
import axios from 'axios';
import qs from 'qs';

// Import other CACCL libs
import CACCLError from 'caccl-error';

// Import shared types
import ErrorCode from './ErrorCode';

// Check if we should send cross-domain credentials
const sendCrossDomainCredentials = (process.env.NODE_ENV === 'development');

/**
 * Sends and retries an http request
 * @author Gabriel Abrams
 * @param opts object containing all arguments
 * @param opts.path path to send request to
 * @param [opts.host] host to send request to
 * @param [opts.method=GET] http method to use
 * @param [opts.params] body/data to include in the request
 * @param [opts.headers] headers to include in the request
 * @param [opts.numRetries=0] number of times to retry the request if it
 *   fails
 * @returns { body, status, headers } on success
 */
const sendRequest = async (
  opts: {
    path: string,
    host?: string,
    method?: ('GET' | 'POST' | 'PUT' | 'DELETE'),
    params?: { [k in string]: any },
    headers?: { [k in string]: any },
    numRetries?: number,
  },
): Promise<{
  body: any,
  status: number,
  headers: { [k in string]: any },
}> => {
  // Set max number of retries if not defined
  const numRetries = (opts.numRetries ? opts.numRetries : 0);

  // Process method
  const method: ('GET' | 'POST' | 'PUT' | 'DELETE') = (opts.method || 'GET');

  // Stringify parameters
  const stringifiedParams = qs.stringify(opts.params || {}, {
    encodeValuesOnly: true,
    arrayFormat: 'brackets',
  });

  // Create url (include query if GET)
  const query = (method === 'GET' ? `?${stringifiedParams}` : '');
  let url;
  if (!opts.host) {
    // No host included at all. Just send to a path
    url = `${opts.path}${query}`;
  } else {
    url = `https://${opts.host}${opts.path}${query}`;
  }

  // Update headers
  const headers = opts.headers || {};
  let data = null;
  if (!headers['Content-Type']) {
    // Form encoded
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    // Add data if applicable
    data = (method !== 'GET' ? stringifiedParams : null);
  } else {
    // JSON encode
    data = opts.params;
  }

  // Send request
  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      withCredentials: sendCrossDomainCredentials,
    });

    // Process response
    return {
      body: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (err) {
    // Axios throws an error if the request status indicates an error
    // sendRequest is supposed to resolve if the request went through, whether
    // the status indicates an error or not.
    if (err.response) {
      // Resolve with response
      return {
        body: err.response.data,
        status: err.response.status,
        headers: err.response.headers,
      };
    }

    // Request failed! Check if we have more attempts
    if (numRetries > 0) {
      // Update opts with one less retry
      return sendRequest({
        ...opts,
        numRetries: opts.numRetries - 1,
      });
    }

    // Self-signed certificate error:
    if (err.message.includes('self signed certificate')) {
      throw new CACCLError({
        message: 'We refused to send a request because the receiver has self-signed certificates.',
        code: ErrorCode.SelfSigned,
      });
    }

    // No tries left
    throw new CACCLError({
      message: 'We encountered an error when trying to send a network request. If this issue persists, contact an admin.',
      code: ErrorCode.NotConnected,
    });
  }
};

export default sendRequest;

// Import libs
import axios from 'axios';
import qs from 'qs';
import CACCLError from 'caccl-error';
import https from 'https';

// Import shared types
import ErrorCode from './ErrorCode';

// Create an agent to ignore unauthorize ssl issues
const ignoreSSLIssuesAgent = new https.Agent({ rejectUnauthorized: false });

// Check if we should send cross-domain credentials
const sendCrossDomainCredentials = !!(
  process.env.DEV
  || process.env.NODE_ENV === 'development'
);

/**
 * Sends and retries an http request
 * @author Gabriel Abrams
 * @param opts object containing all arguments
 * @param opts.host host to send request to
 * @param opts.path path to send request to
 * @param [opts.method=GET] http method to use
 * @param [opts.params] body/data to include in the request
 * @param [opts.headers] headers to include in the request
 * @param [opts.numRetries=0] number of times to retry the request if it
 *   fails
 * @param [opts.ignoreSSLIssues=false] if true, ignores SSL certificate
 *   issues. If host is localhost:8088, this will default to true
 * @returns Returns { body, status, headers } on success
 */
const sendRequest = async (
  opts: {
    host: string,
    path: string,
    method?: ('GET' | 'POST' | 'PUT' | 'DELETE'),
    params?: { [k in string]: any },
    headers?: { [k in string]: any },
    numRetries?: number,
    ignoreSSLIssues?: boolean,
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

  // Default ignoreSSLIssues
  const ignoreSSLIssues = (
    opts.ignoreSSLIssues !== undefined
      ? opts.ignoreSSLIssues
      : opts.host === 'localhost:8088'
  );

  // Prep to ignore ssl issues
  const httpsAgent = (
    ignoreSSLIssues
      ? ignoreSSLIssuesAgent
      : undefined
  );

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
      httpsAgent,
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

// Import libs
import qs from 'qs';

// Import other CACCL libs
import CACCLError from 'caccl-error';

// Import shared types
import ErrorCode from './ErrorCode';

// Check if we're currently in developer mode
const thisIsDev = (process.env.NODE_ENV === 'development');

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
 * @param [opts.sendCrossDomainCredentials=true if in development mode] if true,
 *   send cross-domain credentials even if not in dev mode
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
    sendCrossDomainCredentials?: boolean,
  },
): Promise<{
  body: any,
  status: number,
  headers: { [k in string]: any },
}> => {
  // Check if we should be including credentials
  const sendCrossDomainCredentials = !!(
    opts.sendCrossDomainCredentials
    || thisIsDev
    || opts.headers?.credentials === 'include'
  );

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
    const response = await fetch(
      url,
      {
        method,
        mode: 'cors',
        headers: headers ?? {},
        body: (
          method !== 'GET'
            ? new URLSearchParams(data)
            : undefined
        ),
        credentials: (
          sendCrossDomainCredentials
            ? 'include'
            : 'same-origin'
        ),
        redirect: 'follow',
        referrerPolicy: (sendCrossDomainCredentials ? 'no-referrer' : 'origin'),
      },
    );

    // Get headers map
    const responseHeaders: {
      [k in string]: string
    } = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Process json response
    try {
      const responseBody = await response.json();
      return {
        body: responseBody,
        status: response.status,
        headers: responseHeaders,
      };
    } catch (jsonErr) {
      // Not JSON
      throw new CACCLError({
        message: `Response was not valid JSON: ${(jsonErr as any)?.message}`,
        code: ErrorCode.NotJSON,
      });
    }
  } catch (err) {
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
      message: `We encountered an error when trying to send a network request. If this issue persists, contact an admin. Error: ${(err as any)?.message}`,
      code: ErrorCode.NotConnected,
    });
  }
};

export default sendRequest;

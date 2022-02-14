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
declare const sendRequest: (opts: {
    host: string;
    path: string;
    method?: ('GET' | 'POST' | 'PUT' | 'DELETE');
    params?: {
        [x: string]: any;
    };
    headers?: {
        [x: string]: any;
    };
    numRetries?: number;
    ignoreSSLIssues?: boolean;
}) => Promise<{
    body: any;
    status: number;
    headers: {
        [x: string]: any;
    };
}>;
export default sendRequest;
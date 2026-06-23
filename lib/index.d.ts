/**
 * Sends and retries an http request
 * @author Gabriel Abrams
 * @author Yuen Ler Chow
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
 * @param [opts.responseType=JSON] expected response type
 * @returns { body, status, headers } on success
 */
declare const sendRequest: (opts: {
    path: string;
    host?: string;
    method?: ('GET' | 'POST' | 'PUT' | 'DELETE');
    params?: {
        [x: string]: any;
    };
    headers?: {
        [x: string]: any;
    };
    numRetries?: number;
    sendCrossDomainCredentials?: boolean;
    responseType?: 'Text' | 'JSON';
}) => Promise<{
    body: any;
    status: number;
    headers: {
        [x: string]: any;
    };
}>;
export default sendRequest;

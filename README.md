# caccl-send-request
The default request sender used throughout the CACCL project.

## Part of the CACCL library
**C**anvas  
**A**pp  
**C**omplete  
**C**onnection  
**L**ibrary  

## Description

Sends an http request, handles paging, retries failed requests, and processes the response.

Argument | Type | Description | Default
:--- | :--- | :--- | :---
host | string | host to send the request to | none
path | string | path to send the request to | none
method | string | http method to use | GET
params | object | query/body/data to include in the request | {}
headers | object | headers to include in the request | {}
numRetries | number | number of times to retry the request if it fails | 0
ignoreSSLIssues | boolean | if true, ignores self-signed certificate issues | false usually, true if host is `localhost:8088`

Returns:
`Promise.<CACCLError|object>` Returns promise that resolves with `{ body, status, headers }` on success, rejects with CACCLError (see `caccl-error` on npm) on failure.

**Note:** This function sends cross-origin credentials if `process.env.NODE_ENV` equals `development`.

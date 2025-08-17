# Simple PowerShell HTTP Server
$port = 8000
$url = "http://localhost:$port/"

Write-Host "Starting HTTP Server on $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($url)
    $listener.Start()
    
    Write-Host "Server started successfully!" -ForegroundColor Green
    Write-Host "Open your browser and navigate to: $url" -ForegroundColor Cyan
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $requestPath = $request.Url.AbsolutePath
        if ($requestPath -eq "/") {
            $requestPath = "/index.html"
        }
        
        $filePath = Join-Path $PWD $requestPath.TrimStart('/')
        
        Write-Host "Request: $($request.HttpMethod) $requestPath" -ForegroundColor Gray
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".gif" { $response.ContentType = "image/gif" }
                ".svg" { $response.ContentType = "image/svg+xml; charset=utf-8" }
                ".ico" { $response.ContentType = "image/x-icon" }
                default { $response.ContentType = "text/plain; charset=utf-8" }
            }
            
            $response.ContentLength64 = $buffer.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $errorContent = "<html><body><h1>404 - File Not Found</h1><p>The requested file '$requestPath' was not found.</p></body></html>"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        Write-Host "Server stopped." -ForegroundColor Yellow
    }
}
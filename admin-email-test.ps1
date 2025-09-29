# Test script for Admin Approve/Reject Email functionality
Write-Host "=== ADMIN EMAIL FUNCTIONALITY TEST ===" -ForegroundColor Green
Write-Host ""

# First, let's get the list of requests to find one to test with
Write-Host "1. Fetching current requests..." -ForegroundColor Yellow
try {
    $requestsResponse = Invoke-WebRequest -Uri "https://usthbrecours.netlify.app/.netlify/functions/admin-requests" -Method GET
    $requests = $requestsResponse.Content | ConvertFrom-Json
    
    Write-Host "   Found $($requests.Count) requests" -ForegroundColor Green
    
    if ($requests.Count -eq 0) {
        Write-Host "   No requests found. Please submit a test request first." -ForegroundColor Red
        exit
    }
    
    # Show pending requests
    $pendingRequests = $requests | Where-Object { $_.status -eq "pending" }
    if ($pendingRequests.Count -eq 0) {
        Write-Host "   No pending requests found. All requests have been processed." -ForegroundColor Yellow
        Write-Host "   Available requests:" -ForegroundColor Cyan
        $requests | ForEach-Object { 
            Write-Host "     ID: $($_.id), Status: $($_.status), Email: $($_.email)" 
        }
    } else {
        Write-Host "   Pending requests available for testing:" -ForegroundColor Cyan
        $pendingRequests | ForEach-Object { 
            Write-Host "     ID: $($_.id), Student: $($_.prenom) $($_.nom), Email: $($_.email)" 
        }
    }
} catch {
    Write-Host "   ERROR: Cannot fetch requests - $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Get test parameters
$requestId = Read-Host "Enter the Request ID to test with"
$action = Read-Host "Enter action (approved/rejected)"
$adminName = Read-Host "Enter admin name"
$adminComment = Read-Host "Enter admin comment (optional)"

if (-not $requestId -or -not $action -or -not $adminName) {
    Write-Host "Missing required parameters" -ForegroundColor Red
    exit
}

if ($action -ne "approved" -and $action -ne "rejected") {
    Write-Host "Action must be 'approved' or 'rejected'" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "2. Testing admin decision email..." -ForegroundColor Yellow

# Prepare the test data
$testData = @{
    id = [int]$requestId
    status = $action
    adminName = $adminName
    adminComment = if ($adminComment) { $adminComment } else { $null }
} | ConvertTo-Json

Write-Host "   Sending $action decision for request ID $requestId..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "https://usthbrecours.netlify.app/.netlify/functions/admin-requests-id" -Method PATCH -Body $testData -ContentType "application/json"
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Message: $($result.message)" -ForegroundColor Green
    Write-Host "   Email Sent: $($result.emailSent)" -ForegroundColor $(if($result.emailSent) { "Green" } else { "Red" })
    
    if ($result.emailSent) {
        Write-Host ""
        Write-Host "✅ SUCCESS: Admin decision email sent successfully!" -ForegroundColor Green
        Write-Host "The student should receive an email notification about the $action decision." -ForegroundColor Cyan
        Write-Host "Subject should be: 'Votre demande de changement de spécialité a été $action - USTHB'" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ ISSUE: Email was not sent" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "   Error Details: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "   Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Check the student's email (including spam folder) for the decision notification." -ForegroundColor Yellow
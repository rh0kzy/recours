# Enhanced email test script
Write-Host "=== EMAIL FUNCTIONALITY TEST ===" -ForegroundColor Green
Write-Host ""

# Test 1: Check if email service is configured
Write-Host "1. Testing email service configuration..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://usthbrecours.netlify.app/.netlify/functions/health" -Method GET
    $healthData = $healthResponse.Content | ConvertFrom-Json
    
    Write-Host "   Database: $($healthData.environment.hasDatabase)" -ForegroundColor $(if($healthData.environment.hasDatabase) { "Green" } else { "Red" })
    Write-Host "   Email Config: $($healthData.environment.hasEmailConfig)" -ForegroundColor $(if($healthData.environment.hasEmailConfig) { "Green" } else { "Red" })
} catch {
    Write-Host "   ERROR: Cannot connect to health endpoint" -ForegroundColor Red
}

Write-Host ""

# Test 2: Submit a request with a real email
Write-Host "2. Submitting test request..." -ForegroundColor Yellow
$testEmail = Read-Host "Enter your email address for testing"

$testData = @{
    matricule = "TEST" + (Get-Date -Format "HHmmss")
    nom = "TestUser"
    prenom = "Email"
    email = $testEmail
    telephone = "0123456789"
    specialiteActuelle = "Informatique"
    specialiteSouhaitee = "Génie Logiciel"
    raison = "Test de fonctionnement du système d'email - " + (Get-Date)
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://usthbrecours.netlify.app/.netlify/functions/submit-request" -Method POST -Body $testData -ContentType "application/json"
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Admin Email Sent: $($result.adminEmailSent)" -ForegroundColor $(if($result.adminEmailSent) { "Green" } else { "Red" })
    Write-Host "   Student Email Sent: $($result.studentEmailSent)" -ForegroundColor $(if($result.studentEmailSent) { "Green" } else { "Red" })
    
    if ($result.adminEmailSent -and $result.studentEmailSent) {
        Write-Host ""
        Write-Host "✅ SUCCESS: Both emails sent successfully!" -ForegroundColor Green
        Write-Host "Check your email inbox and spam folder for the confirmation email." -ForegroundColor Cyan
        Write-Host "Subject should be: 'Confirmation de demande de changement de spécialité - USTHB'" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ ISSUE: One or both emails failed to send" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Error Details: $errorContent" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Green
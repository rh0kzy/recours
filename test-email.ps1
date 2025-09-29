# Test script to submit a request and check if emails are sent
$testData = @{
    matricule = "TEST123456"
    nom = "Test"
    prenom = "User"
    email = "your-email@gmail.com"  # Replace with your actual email for testing
    telephone = "0123456789"
    specialiteActuelle = "Informatique"
    specialiteSouhaitee = "Génie Logiciel"
    raison = "Test de fonctionnement du système d'email"
} | ConvertTo-Json

Write-Host "Submitting test request to check email functionality..."
Write-Host "Test data: $testData"

try {
    $response = Invoke-WebRequest -Uri "https://usthbrecours.netlify.app/.netlify/functions/submit-request" -Method POST -Body $testData -ContentType "application/json"
    
    Write-Host "Response Status: $($response.StatusCode)"
    Write-Host "Response Content: $($response.Content)"
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "`nEmail Status:"
    Write-Host "Admin Email Sent: $($result.adminEmailSent)"
    Write-Host "Student Email Sent: $($result.studentEmailSent)"
    
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
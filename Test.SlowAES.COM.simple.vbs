''
'' Test.SlowAES.Com.Simple.vbs
''
'' demonstrates the use Of the SlowAES Windows Script Component
'' from a VBScript client.
''
''
'' This code is licensed under the Microsoft Public License. See the
'' accompanying License.txt file for details.
''
'' Copyright 2009 Dino Chiesa
''



' 
' byteArrayToHexString
' convert a byte array to hex string.
'
Function byteArrayToHexString(a)
    Dim r,b,i
    r = ""
    For i = 0 To UBound(a)
        b = Hex( (a(i) And &HF0) / 16) & Hex(a(i) And &HF)
        r= r & b
    Next
    byteArrayToHexString= r
End Function

'
' hexStringToByteArray
' convert a string of hex byts to a byte array
'
Function hexStringToByteArray(s)
    Dim r()
    ReDim r(Len(s)/2-1)
    Dim x
    For i = 0 To  Len(s)-2 Step 2
        x= "&H" & Mid(s,i+1,2)
        r(i/2) = CInt(x)
    Next
    hexStringToByteArray= r
End Function




Function DemoEncryption()

    WScript.echo "Testing Ionic.Com.SlowAES..."

    WScript.echo "key:               " & byteArrayToHexString(key)
    WScript.echo "iv:                " & byteArrayToHexString(iv)
    WScript.echo "key length:        " & keyLengthInBytes & " bytes"
    WScript.echo "key length:        " & (keyLengthInBytes*8) & " bits"
    WScript.echo "plaintext:         " & plaintext
    WScript.echo "plaintext.length:  " & Len(plaintext)

    WScript.echo "instantiate Ionic.Com.SlowAES"
    Dim aes
    set aes = CreateObject("Ionic.Com.SlowAES")

    aes.KeySize = keyLengthInBytes * 8
    aes.Key = byteArrayToHexString(key)
    aes.IV= byteArrayToHexString(iv)
    aes.Mode = "CBC"

    WScript.echo "encrypting... "
    Dim result
    result= aes.EncryptString(plaintext)

    'WScript.echo "Cryptotext: " & result
    ' result is a comma-separated string
    ' if we Eval() on it we convert it to an array
    Dim expr
    expr = "Array(" & result & ")" 
    result= Eval( expr )

    WScript.echo "Cryptotext/Eval:   " & byteArrayToHexString(result)
    WScript.echo "Cryptotext.length: " & UBound(result)+1
    
    WScript.echo "decrypting... "
    Dim decrypted
    'The javascript way to do this is to pass the byte array.
    ' Like so:
    '    var decrypted = aes.DecryptBytesToString(result);
    '
    'This does not work from VBScript. So, convert to a hexstring,
    'pass the hex string, and then convert back, in the COM component.
    decrypted= aes.DecryptBytesToString(byteArrayToHexString(result))

    WScript.echo "decrypted:         " & decrypted

End Function




dim plaintext, iv, key, keyLengthInBytes

plaintext= "Hello. This is a test. of the emergency broadcasting system."
' iv must be a hexstring representation of an array of bytes, length=16
iv =  hexStringToByteArray("feedbeeffeedbeefbaadf00dbaadf00d")
' key must be a hexstring representation of an array of bytes, length=16 or 32
key = hexStringToByteArray("cafebabe0099887766554433221100AA")
keyLengthInBytes= UBound(key)+1


If Err.Number <> 0 Then Err.Clear
    
Call DemoEncryption
    
If (Err.Number <> 0) Then WScript.echo("Error: " & Err.Description)



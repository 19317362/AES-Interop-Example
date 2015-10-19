''
'' Test.SlowAES.Com.vbs
''
'' demonstrates the use Of the SlowAES Windows Script Component
'' from a VBScript client.
''
'' For usage:
''   .\Test.SlowAES.COM.js  -help
''
'' Example 1: 
''
'' To test the first Example Vector, as defined by NIST in
'' http:''csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf, 
'' for 128-bit AES CBC:
''
'' .\Test.SlowAES.COM.vbs -k 2b7e151628aed2a6abf7158809cf4f3c 
''                       -pt 6bc1bee22e409f96e93d7e117393172a 
''                       -ivh 000102030405060708090a0b0c0d0e0f
''   
'' Example 2:
'' 
'' To demonstrate password-based key derivation and encryption of an 
'' ASCII String: 
'' 
'' .\Test.SlowAES.COM.vbs -p "Password1"  -t "This is the text to encrypt"
''
'' =======================================================
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



Function byteArrayToAscii(a)
    dim r
    r= ""
    for i = 0 to UBound(a)-1
        r = r & Chr(a(i))
    next
    byteArrayToAscii= r
End Function


Function asciiToByteArray(s)
    Dim r()
    ReDim r(Len(s))
    For i = 0 To Len(s)-1
        r(i)= Asc(Mid(s,i+1,1))
    Next
    asciiToByteArray= r
End Function


Sub UsageAndExit
    WScript.echo vbcrlf
    WScript.echo "Test.SlowAES.COM.vbs: do AES encryption with varying keystrength, plaintext, IV, salt."
    WScript.echo "    uses PCKDF2 for key derivation."
    WScript.echo "Usage:" 
    WScript.echo "  Test.SlowAES.COM.vbs [arguments]"
    WScript.echo "     -p <password> | -k <keyHexString>"
    WScript.echo "     -sh <saltHexString> | -ss <saltString>"
    WScript.echo "     -l <keylengthInBytes>"
    WScript.echo "     -i <iterations>"
    WScript.echo "     -ivh <ivHexString> | -ivs <ivString>"
    WScript.echo "     -pth <plainTextHexString> | -pts <text> "
    WScript.Quit 1
End Sub



Sub ProcessArgs
    Dim args
    Set args= WScript.Arguments
    For i = 0 To args.Length-1

        Select Case args(i)
            Case "-p"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    password = args(i)

            Case "-k"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    key = args(i)

            case "-sh"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    salt = hexStringToByteArray(args(i))

            case "-ss"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    salt = asciiToByteArray(args(i))

            case "-ivh"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    iv = hexStringToByteArray(args(i))

            case "-ivs"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    iv = asciiToByteArray(args(i))

            case "-l"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    keyLengthInBytes = CInt(args(i))

            case "-pts"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    plainText = args(i)

            case "-pth"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    plainTextHexString = args(i)

            case "-i"
                i = i + 1
                if (args.Length <= i) Then Call UsageAndExit
                    iterations = CInt(args(i))

            Case Else      Call UsageAndExit
                
        End Select
    Next

    ' validation
    If (key <> "") AND (password <> "") Then Call UsageAndExit

    If (plainText <> "") AND (plainTextHexString <> "") Then 
        Call UsageAndExit
    End If

    ' default values
    If (key = "") AND (password = "") Then
        password= "Albatros1"
    End If 

    If (plainText = "") AND (plainTextHexString = "") Then
        plainText= "Hello. This is a test. of the emergency broadcasting system."
    End If

    
End Sub



Function DemoEncryption()

    WScript.echo "Testing Ionic.Com.SlowAES..."
    WScript.echo "   also uses Ionic.Com.PBKDF2..."

    If password <> "" Then
        WScript.echo "password:          " & password
        'WScript.echo "salt:              " & salt
        WScript.echo "salt (ascii):      " & byteArrayToAscii(salt)
        WScript.echo "salt (hex):        " & byteArrayToHexString(salt)
        WScript.echo "iterations:        " & iterations
    End If
    'WScript.echo "iv:               " & iv
    WScript.echo "iv (hex):          " & byteArrayToHexString(iv)
    WScript.echo "key length:        " & keyLengthInBytes & " bytes"
    WScript.echo "key length:        " & (keyLengthInBytes*8) & " bits"
    If plainText <> "" Then
        WScript.echo "plainText:         " & plainText
        WScript.echo "plainText.length:  " & Len(plainText)
    Else 
        WScript.echo "plainText (hex):   " & plainTextHexString
    End If

    ' maybe derive the key from the password
    If (password <> "") Then
    WScript.echo "instantiate Ionic.Com.PBKDF2"
    Dim pbkdf2
    Set pbkdf2= CreateObject("Ionic.Com.PBKDF2")
    pbkdf2.Init password, byteArrayToAscii(salt), iterations
    key= pbkdf2.DeriveBytes(keyLengthInBytes)
    'key is a hex string
    End If
    
    WScript.echo "key:               " & key

    if ((UBound(hexStringToByteArray(key)) +1) <> keyLengthInBytes) Then
        raise "incorrect key length. (" & hexStringToByteArray(key).length  & "!=" & keyLengthInBytes & ")"
    End If 

    
    WScript.echo "instantiate Ionic.Com.SlowAES"
    Dim aes
    set aes = CreateObject("Ionic.Com.SlowAES")
    aes.KeySize = keyLengthInBytes * 8
    aes.Key = key
    aes.IV= byteArrayToHexString(iv)
    aes.Mode = "CBC"

    WScript.echo "encrypting... "
    Dim result
    If (plaintext <> "") Then
        result = aes.EncryptString(plainText)
    Else 
        result = aes.EncryptBytes(plainTextHexString)
    End If

    ' result is a byte array
    
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
    
    If (plainText <> "") Then
        decrypted = aes.DecryptBytesToString(byteArrayToHexString(result))
        WScript.echo "decrypted:         " & decrypted
        WScript.echo
        If (plainText <> decrypted) Then
            WScript.echo "The roundtrip encrypt/decrypt was not successful."
        Else
            WScript.echo "The roundtrip encrypt/decrypt was successful."
        End If

    Else
        'decrypted = byteArrayToHexString(aes.DecryptBytes(byteArrayToHexString(result)))
        decrypted = aes.DecryptBytes(byteArrayToHexString(result))
        expr = "Array(" & decrypted & ")" 
        decrypted= byteArrayToHexString(Eval( expr ))
        WScript.echo "decrypted:         " & decrypted
        WScript.echo
        If (UCase(plainTextHexString) <> UCase(decrypted)) Then
            WScript.echo "The roundtrip encrypt/decrypt was not successful."
        Else
            WScript.echo "The roundtrip encrypt/decrypt was successful."
        End If
    End If


End Function




dim plainText
plainText= ""
dim plainTextHexString
plainTextHexString= ""
dim password
password= ""
dim key
dim salt
salt= asciiToByteArray("saltines")
Dim iv
iv =   hexStringToByteArray("feedbeeffeedbeefbaadf00dbaadf00d")
dim iterations
iterations=  1000
Dim keyLengthInBytes
keyLengthInBytes= 16


    If Err.Number <> 0 Then Err.Clear
        Call ProcessArgs
        Call DemoEncryption
        If (Err.Number <> 0) Then
            WScript.echo("Error: " & Err.Description)
        End If


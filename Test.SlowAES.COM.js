//
// Test.SlowAES.Com.js
//
// demonstrates the use Of the SlowAES Windows Script Component
// from a Javascript client.
//
// For usage:
//   .\Test.SlowAES.COM.js  -help
//
// Example 1: 
//
// To test the first Example Vector, as defined by NIST in
// http://csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf, 
// for 128-bit AES CBC:
//
// .\Test.SlowAES.COM.js -k 2b7e151628aed2a6abf7158809cf4f3c 
//                       -pt 6bc1bee22e409f96e93d7e117393172a 
//                       -ivh 000102030405060708090a0b0c0d0e0f
//   
// Example 2:
// 
// To demonstrate password-based key derivation and encryption of an 
// ASCII String: 
// 
// .\Test.SlowAES.COM.js -p "Password1"  -t "This is the text to encrypt"
//
// =======================================================
//
// This code is licensed under the Microsoft Public License. See the
// accompanying License.txt file for details.
//
// Copyright 2009 Dino Chiesa
//


/* 
* byteArrayToString
* convert a byte array to hex string.
*/
function byteArrayToHexString(a)
{
    try { hexcase } catch(e) { hexcase=0; }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var r= "";
    for (var i = 0; i < a.length; i++)
    {
        var b  = hex_tab.charAt((a[i] >> 4) & 0x0F) + 
            hex_tab.charAt(a[i] & 0x0F);
        r+= b;
    }
    return r;
}

/* 
* hexStringToArray
* convert a string of hex byts to a byte array
*/
function hexStringToByteArray(s)
{
    try { hexcase } catch(e) { hexcase=0; }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var r= Array(s.length/2);
    for (var i = 0; i < s.length; i+=2)
    {
        r[i/2] = parseInt(s.substr(i,2),16);
    }
    return r;
}

function byteArrayToAscii(a)
{
    var r= "";
    for (var i = 0; i < a.length; i++)
    {
        r+= String.fromCharCode(a[i]);
    }
    return r;
}


function asciiToByteArray(s)
{
    var r= Array(s.length);
    for (var i = 0; i < s.length; i++)
    {
        r[i]= s.charCodeAt(i);
    }
    return r;
}


function UsageAndExit()
{
    WScript.echo();
    WScript.echo("Test.SlowAES.COM.vbs: do AES encryption with varying keystrength, plaintext, IV, salt.");
    WScript.echo("    uses PCKDF2 for key derivation.");
    WScript.echo("Usage:" );
    WScript.echo("  Test.SlowAES.COM.vbs [arguments]");
    WScript.echo("     -p <password> | -k <keyHexString>");
    WScript.echo("     -sh <saltHexString> | -ss <saltString>");
    WScript.echo("     -l <keylengthInBytes>");
    WScript.echo("     -i <iterations>");
    WScript.echo("     -ivh <ivHexString> | -ivs <ivString>");
    WScript.echo("     -pth <plainTextHexString> | -pts <text> ");
    WScript.Quit(1);
}



function ProcessArgs()
{
    var args = WScript.Arguments;
    for (var i = 0; i < args.length; i++)
    {
        switch (args(i)) {
        case "-p":
            if (args.length <= ++i) UsageAndExit();
            password = args(i);
            break;
        case "-k":
            if (args.length <= ++i) UsageAndExit();
            key = args(i);
            break;
        case "-sh":
            if (args.length <= ++i) UsageAndExit();
            salt = hexStringToByteArray(args(i));
            break;
        case "-ss":
            if (args.length <= ++i) UsageAndExit();
            salt = asciiToByteArray(args(i));
            break;
        case "-ivh":
            if (args.length <= ++i) UsageAndExit();
            iv = hexStringToByteArray(args(i));
            break;
        case "-ivs":
            if (args.length <= ++i) UsageAndExit();
            iv = asciiToByteArray(args(i));
            break;
        case "-l":
            if (args.length <= ++i) UsageAndExit();
            keyLengthInBytes = parseInt(args(i));
            break;
        case "-pts":
            if (args.length <= ++i) UsageAndExit();
            plainText = args(i);
            break;
        case "-pth":
            if (args.length <= ++i) UsageAndExit();
            plainTextHexString = args(i);
            break;
        case "-i":
            if (args.length <= ++i) UsageAndExit();
            iterations = parseInt(args(i));
            break;
        default:
            WScript.echo("Unrecognized option. (" + args(i) + ")");
        case "-h":
        case "-help":
        case "-?":
            UsageAndExit();
            break;
        }
    }
    // validation
    if ((key != "") && (password != ""))
        UsageAndExit();

    if ((plainText != "") && (plainTextHexString != ""))
        UsageAndExit();

    // default values
    if ((key == "") && (password == ""))
        password= "Albatros1";

    if ((plainText == "") && (plainTextHexString == ""))
        plainText= "Hello. This is a test. of the emergency broadcasting system.";

}

function DemoEncryption()
{
    WScript.echo( "Testing Ionic.Com.SlowAES...");
    WScript.echo( "   also uses Ionic.Com.PBKDF2...");

    if (password != "")
    {
        WScript.echo( "password:          " + password);
        WScript.echo( "salt:              " + salt);
        WScript.echo( "salt (ascii):      " + byteArrayToAscii(salt));
        WScript.echo( "salt (hex):        " + byteArrayToHexString(salt));
        WScript.echo( "iterations:        " + iterations);
    }
    WScript.echo( "iv:                " + iv);
    WScript.echo( "iv (hex):          " + byteArrayToHexString(iv));
    WScript.echo( "key length:        " + keyLengthInBytes + " bytes");
    WScript.echo( "key length:        " + (keyLengthInBytes*8) + " bits");
    if (plainText != "")
    {
        WScript.echo( "plainText:         " + plainText);
        WScript.echo( "plainText.length:  " + plainText.length);
    }
    else 
        WScript.echo( "plainText (hex):   " + plainTextHexString);

    // maybe derive the key from the password
    if (password != "")
    {
        WScript.echo( "instantiate Ionic.Com.PBKDF2");
        var pbkdf2 = new ActiveXObject("Ionic.Com.PBKDF2");
        pbkdf2.Init(password, byteArrayToAscii(salt), iterations);
        key = pbkdf2.DeriveBytes(keyLengthInBytes);
        // key is a now hex string
    }
    WScript.echo( "key:               " + key);

    if (hexStringToByteArray(key).length != keyLengthInBytes)
        throw "incorrect key length. (" + hexStringToByteArray(key).length  + "!=" + keyLengthInBytes + ")" ;


    WScript.echo( "instantiate Ionic.Com.SlowAES");
    var aes = new ActiveXObject("Ionic.Com.SlowAES");
    aes.KeySize = (keyLengthInBytes*8);  // bits
    aes.Key= key;
    aes.IV= byteArrayToHexString(iv);
    aes.Mode = "CBC";

    WScript.echo( "encrypting... ");
    var result = "";
    if (plainText != "")
        result = aes.EncryptString(plainText);
    else 
        result = aes.EncryptBytes(hexStringToByteArray(plainTextHexString));

    // result is a byte array
    WScript.echo( "Cryptotext:        " + byteArrayToHexString(result));
    WScript.echo( "Cryptotext.length: " + result.length);

    WScript.echo( "decrypting... ");
    var decrypted = "";
    if (plainText != "")
    {
        decrypted = aes.DecryptBytesToString(result);
        WScript.echo( "decrypted:         " + decrypted);
        WScript.echo();
        if (plainText != decrypted)
            WScript.echo("The roundtrip encrypt/decrypt was not successful.");
        else
            WScript.echo("The roundtrip encrypt/decrypt was successful.");
    }
    else
    {
        decrypted = byteArrayToHexString(aes.DecryptBytes(result));
        WScript.echo( "decrypted:         " + decrypted);
        WScript.echo();
        if (plainTextHexString.toUpperCase() != decrypted.toUpperCase())
            WScript.echo("The roundtrip encrypt/decrypt was not successful.");
        else
            WScript.echo("The roundtrip encrypt/decrypt was successful.");
    }
}


var plainText = "";
var plainTextHexString = "";
var password = "";
var key = "";
var salt = asciiToByteArray("saltines");
var iv =   hexStringToByteArray("feedbeeffeedbeefbaadf00dbaadf00d");
//var iv =   hexStringToByteArray("00000000000000000000000000000000");
var iterations =  1000;
var keyLengthInBytes = 16;


try 
{
    ProcessArgs();
    DemoEncryption();
}
catch(e)
{
    WScript.echo("Exception: " + e); 
    //     WScript.echo(e.Number + ": " + e.Name);
    WScript.echo(e.message);
}


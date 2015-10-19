//
// Test.PBKDF2.COM.js
//
// demonstrates the use of the Ionic.Com.PBKDF2 component, from Javascript.
//
//
// This code is licensed under the Microsoft Public License. See the
// accompanying License.txt file for details.
//
// Copyright 2009 Dino Chiesa
//


var password = "Albatros1";
var salt = "saltines";
var iterations =  1000;
var keyLengthInBytes = 16;
WScript.echo( "Testing PBKDF2...");

try
{

    WScript.echo( "password:   " + password);
    WScript.echo( "salt:       " + salt);
    WScript.echo( "iterations: " + iterations);
    WScript.echo( "key length: " + keyLengthInBytes + " bytes");
    WScript.echo( "key length: " + (keyLengthInBytes*8) + " bits");

    WScript.echo();
    WScript.echo( "hex hash: " + hash);
    WScript.echo();

}
catch(e)
{
    WScript.echo("Exception: " + e); 
    //     WScript.echo(e.Number + ": " + e.Name);
    WScript.echo(e.Message);
}




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
    WScript.echo ("r = " + r);
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
    Console.WriteLine("\nPBKDF2: generate keys from passwords using RFC2898 PBKDF2.\n");
    Console.WriteLine("Usage:\n  PBKDF2 [-p <password>] [-sh <saltHexString>] [-l <length>] [-i <iterations>]");
    WScript.Quit(1);
}


var password = "Albatros1";
//var salt = "saltines";
var salt = [0x73,0x61,0x6c,0x74,0x69,0x6e,0x65,0x73]; // saltines
//var salt = [0x1, 0x2, 0x3, 0x4, 0xba, 0xbe, 0xca, 0xfe];
var iterations =  1000;
var keyLengthInBytes = 16;

var args = WScript.Arguments;
for (var i = 0; i < args.length; i++)
{
    switch (args(i)) {
    case "-p":
        if (args.length <= ++i) UsageAndExit();
        password = args(i);
        break;
    case "-sh":
        if (args.length <= ++i) UsageAndExit();
        salt = hexStringToByteArray(args(i));
        break;
    case "-ss":
        if (args.length <= ++i) UsageAndExit();
        salt = asciiToByteArray(args(i));
        break;
    case "-l":
        if (args.length <= ++i) UsageAndExit();
        keyLengthInBytes = parseInt(args(i));
        break;
    case "-":
        if (args.length <= ++i) UsageAndExit();
        iterations = parseInt(args(i));
        break;
    }
}

WScript.echo( "Testing Ionic.Com.PBKDF2...");

try
{
    var saltString = byteArrayToHexString(salt);
    WScript.echo( "password:     " + password);
    WScript.echo( "salt:         " + salt);
    WScript.echo( "salt (ascii): " + byteArrayToAscii(salt));
    WScript.echo( "salt (hex):   " + byteArrayToHexString(salt));
    WScript.echo( "iterations:   " + iterations);
    WScript.echo( "key length:   " + keyLengthInBytes + " bytes");
    WScript.echo( "key length:   " + (keyLengthInBytes*8) + " bits");

    WScript.echo( "instantiate Ionic.Com.PBKDF2");
    var pbkdf2 = new ActiveXObject("Ionic.Com.PBKDF2");

    WScript.echo( "Init" );
    pbkdf2.Init(password, byteArrayToAscii(salt), iterations);

    WScript.echo( "DeriveBytes" );
    var key = pbkdf2.DeriveBytes(keyLengthInBytes);

    WScript.echo();
    WScript.echo( "key:     " + key);
    var iv20 = pbkdf2.DeriveBytes(20);
    WScript.echo( "iv20:    " + iv20);
    WScript.echo();

    //WScript.echo( "binb2hex:    " + rstr2hex(x));

    //var x = hexStringToByteArray("deadbeefcafebabe");
    //WScript.echo( "x:       " + byteArrayToHexString(x));

}
catch(e)
{
    WScript.echo("Exception: " + e); 
    //     WScript.echo(e.Number + ": " + e.Name);
    WScript.echo(e.message);
}

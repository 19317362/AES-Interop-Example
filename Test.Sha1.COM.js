//
// Test.Sha1.COM.js
//
// demonstrates the use of the Ionic.Com.PajSha1 component, from 
// Javascript.
//
//
// This code is licensed under the Microsoft Public License. See the
// accompanying License.txt file for details.
//
// Copyright 2009 Dino Chiesa
//

var plaintext = "Hello. This is a test. of the emergency broadcasting system.";
WScript.echo( "Testing SHA1...");

try
{
    WScript.echo( "plaintext: " + plaintext);
    WScript.echo( "plaintext.length: " + plaintext.length);

    WScript.echo( "instantiate Ionic.Com.PajSha1");
    var sha1 = new ActiveXObject("Ionic.Com.PajSha1");

    var test = sha1.Test();
    WScript.echo( "test: " + test);

    var hash = sha1.SHA1_Hex(plaintext);
    WScript.echo( "hex hash: " + hash);
    WScript.echo();

    hash = sha1.SHA1_B64(plaintext);
    WScript.echo( "B64 hash: " + hash);

}
catch(e)
{
    WScript.echo("Exception: " + e); 
    //     WScript.echo(e.Number + ": " + e.Name);
    WScript.echo(e.Message);
}


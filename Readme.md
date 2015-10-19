# AES Interop Example

Sat, 01 Aug 2009  03:10

This set of files shows how to get AES encryption interoperability
between .NET (C#) and scripting languages like Javascript or VBScript.
This is interesting if you have 2 windows machines, one of which has the
.NET Framework on it, and one which does not.  You can still get good
AES interoperability between them, using the techniques and technology
demonstrated in this example.

- The .NET application uses classes from the
  System.Security.Cryptography namespace, specifically the
  RijndaelManaged class and the Rfc2898DeriveBytes class.

  All the .NET code is licensed under the Microsoft Public License.  See
  the accompanying License.txt file for details.


- The script code uses "Windows Script Components" - COM components
  written in script.  There are three such components included here:

    - Ionic.Com.SlowAES
      a COM wrapper on the SlowAES code found at
      http://code.google.com/p/slowaes/.
      This provides the AES encryption.

    - Ionic.Com.PBKDF2
      a COM wrapper on a modified version of the RFC2898-compliant key
      generator code at http://anandam.name/pbkdf2 . It also uses the Sha1
      code from http://pajhome.org.uk/crypt/md5/sha1.html .
      RFC2898-compliant key derivation is required if you want AES to be
      practical; it generates secure keys from text passwords.
      Obviously if you're doing interop, you need to use the same
      algorithm to generate the key from a text password, on each side.

    - Ionic.Com.PajSha1
      a COM wrapper on a modified version of the Sha1
      code from http://pajhome.org.uk/crypt/md5/sha1.html .
      SHA1 is required by PBKDF2 to generate the passwords.

  The various original Javascript source code is available under various
  distinct licenses.

  In all cases I've rejiggered the source to make it easier to use, and
  especially, better integrated.



## Alternatives

One way to get AES interop between a .NET application and a VBScript
application is to create a COM-callable wrapper on the .NET AES classes,
and then invoke that from VBScript. This works well, but is not
appropriate when the VBScript side does not have .NET available.

Another option is to get a VB6-based  or C++ native AES implementation,
and call *that* from script.  This also works, but I couldn't find
appropriate implementations.

What I did find is Javascript libraries that provide AES, as well as a
PBKDF2 (password-absed key derivation function), and it's requirement,
SHA1.

To expose that to COM environments, including VB6, VBScript, and
Javascript on Windows, I packaged that Javascript code as a "Windows
Script Component".  This is nothing more than a Windows runtime feature
that allows any Javascript or VBScript code to be exposed as a COM
object. It's simple and easy to use.


## Files included here:


Components:

    Ionic.Com.PBKDF2.wsc
      - RFC2898-complant password-based key derivation function
        exposed as a COM component.  Uses Sha1.

    Ionic.Com.SlowAES.wsc
      - AES encryptor, all in Javascript, exposed as a COM component.


Demonstration programs:

    Test.SlowAES.COM.js
      - javascript client of Ionic.Com.SlowAES .

    Test.SlowAES.COM.vbs
      - VBScript client of Ionic.Com.SlowAES .

    RijndaelManaged.cs
      - C# equivalent, calls into System.Security.Crytpography.


    Each of these tools accepts the same set of arguments, including :
      -p password | -k keyHexString
      -i iterations  for the RFC2898 algorithm
      -ss saltString | -sh saltHexString
      -ivs ivString | -ivh ivHexString
      -pth plainTextHexString | -pts plainTextString
      -l keyStrengthInBytes


    There is also:

    Test.SlowAES.COM.Simple.vbs
      - this is also a VBScript client of Ionic.Com.SlowAES.  This
        one takes no arguments, and does not use the PBKDF2 component
        to generate the key used with AES.  May be simpler to understand.


=======================================================

The Sha1 logic is included in the Ionic.Com.PBKDF2.wsc component.  If
you like, you can also access the Sha1 capability directly, via the
Ionic.Com.PajSha1.wsc component.

The demonstration tool for that:

  Test.PajSha1.COM.js

It demonstrates the production of a SHA1 hash from script.

=======================================================

To use this code, follow these steps:


1. Compile the .NET application, using:

    c:\.net3.5\csc.exe /t:exe /debug:full /optimize- /R:System.dll
                /out:RijndaelManaged.exe RijndaelManaged.cs

2. register the COM components:

  %windir%\system32\regsvr32 Ionic.Com.SlowAES.wsc

  %windir%\system32\regsvr32 Ionic.Com.PBKDF2.wsc


3. run the apps:

    .\RijndailManaged

    Test.SlowAES.COM.js

    Test.SlowAES.COM.vbs


-------------------------------------------------------

## Notes:

1.

The VBScript client cannot pass a byte array to a COM object.
The encrypted data is normally delivered as a byte array.
Therefore, the test app converts the byte array to a hex string, then
passes it to a method on the component that accepts a hexstring
representation of the encrypted data, rather than a byte array.

  byte array might look like 0x01, 0x02, 0x03, 0xBA, 0xAD
  a hex string of the same data:  "0102BAAD"


2.

The "Windows Script Components" technology was originally designed to
allow .ASP programmers to encapsulate script code into reusable
components for use on multiple web pages. The technology is not well
known but is supported and reliable on Windows. Some people shy away
from using Script to define a COM component, but just because it is easy
does not mean it is unreliable, hacky, or slow.

Windows Script Components are supported on Windows from Windows 2000
forward.  You do not need .NET in order to use WSC.


3.

The Javascript code running inside the Windows Script Components is just
plain platform-neutral Javascript.  It can be used on any Javascript
host.  The WSC wrapper is the only Windows-specific part of that code.


4.

RFC2898 defines an algorithm for generating a secure key, suitable for
use within a symmetric algorithm, from a password and a salt.  A
function that generates a key from a password is sometimes called
"Password based Key derivation function", or sometimes, PBKDF, and
PBKDF2.

5.

SlowAES is called "slow" only because it is implemented in script.  This
AES implementation is, in fact, slower than the AES implementation in
managed .NET code.  But unless you have very high data volumes, it probably
won't matter.

The big difference in performance between the .NET version of the AES
encryptor and the script version is in the key derivation.  The RFC2898
algorithm is compute intensive and is much slower in script than in C#.


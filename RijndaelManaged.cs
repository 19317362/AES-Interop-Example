//
// RijndaelManaged.cs
//
// demonstrates the use of AES encryption from from a .NET application.
// Uses the System.Security.Cryptography classes.
//
// For usage:
//   RijndaelManaged  -help
//
// Example 1: 
//
// To test the first Example Vector, as defined by NIST in
// http://csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf, 
// for 128-bit AES CBC:
//
// RijndaelManaged -k 2b7e151628aed2a6abf7158809cf4f3c 
//                       -pt 6bc1bee22e409f96e93d7e117393172a 
//                       -ivh 000102030405060708090a0b0c0d0e0f
//   
// Example 2:
// 
// To demonstrate password-based key derivation and encryption of an 
// ASCII String: 
// 
// RijndaelManaged.exe -p "Password1"  -t "This is the text to encrypt"
//
// =======================================================
//
//
// This code is licensed under the Microsoft Public License. See the
// accompanying License.txt file for details.
//
// Copyright 2009 Dino Chiesa
//


using System;
using System.Security.Cryptography;

namespace Ionic.Test
{

    public class RijndaelManagedTest
    {
        string _password;
        string _keyHexString;
        string _plaintext;
        string _plaintextHexString;
        byte[] _salt;
        byte[] _iv;
        int _iterations = 1000;
        int _keyLengthInBytes = 16;
        System.Text.Encoding ascii = System.Text.Encoding.GetEncoding("ascii");

        // ctor
        public RijndaelManagedTest (string[] args)
        {
            for (int i=0; i < args.Length; i++)
            {
                switch (args[i])
                {
                    case "-p":
                        if (_password != null)
                            throw new ArgumentException(args[i]);
                        if (_keyHexString != null)
                            throw new ArgumentException(args[i]);
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _password = args[i];
                        break;
                        
                    case "-k":
                        if (_password != null)
                            throw new ArgumentException(args[i]);
                        if (_keyHexString != null)
                            throw new ArgumentException(args[i]);
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _keyHexString = args[i];
                        break;

                    case "-pts":
                        if (_plaintext != null)
                            throw new ArgumentException(args[i]);
                        if (_plaintextHexString != null)
                            throw new ArgumentException(args[i]);
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _plaintext = args[i];
                        break;
                        
                    case "-pth":
                        if (_plaintext != null)
                            throw new ArgumentException(args[i]);
                        if (_plaintextHexString != null)
                            throw new ArgumentException(args[i]);
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _plaintextHexString = args[i];
                        break;

                    case "-ss":
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _salt = ascii.GetBytes(args[i]);
                        break;

                    case "-sh":
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _salt = HexStringToByteArray(args[i]);
                        break;

                    case "-ivs":
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _iv = ascii.GetBytes(args[i]);
                        break;

                    case "-ivh":
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _iv = HexStringToByteArray(args[i]);
                        break;

                    case "-i":
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _iterations = System.Int32.Parse(args[i]);
                        break;

                    case "-l":
                        i++;
                        if (args.Length <= i) throw new ArgumentException(args[i]);
                        _keyLengthInBytes = System.Int32.Parse(args[i]);
                        break;

                    case "-?":
                    case "-help":
                    case "-h":
                        Usage();
                        break;

                    default:
                        throw new ArgumentException(args[i]);

                }
            }
            
            // default values
            if (_password == null && _keyHexString == null)
                _password = "Albatros1";

            if (_plaintext == null && _plaintextHexString == null)
                _plaintext = "Hello. This is a test. of the emergency broadcasting system.";

            if (_salt == null)
                _salt = ascii.GetBytes("saltines");
            
            if (_iv == null)
                //_iv = new byte[16];
                _iv = HexStringToByteArray("feedbeeffeedbeefbaadf00dbaadf00d");
        }

        public static void Main(string[] args)
        {
            try 
            {
                new RijndaelManagedTest(args)
                    .Run();
            }
            catch (System.Exception exc1)
            {
                Console.WriteLine("Exception: {0}", exc1.ToString());
                Usage();
            }
        }



        public static void Usage()
        {
            Console.WriteLine("\nRijndaelManaged: do AES encryption, using  keys from passwords using RFC2898 PBKDF2.\n");
            Console.WriteLine("Usage:\n  RijndaelManaged <options>\n");
            Console.WriteLine("    -p <password> | -k <keyHexString>");
            Console.WriteLine("    -sh <saltHexString> | -ss <saltString>");
            Console.WriteLine("    -ivh <ivHexString> | -ivs <ivString>");
            Console.WriteLine("    -pth <plainTextHexString> | -pts <plainText>");
            Console.WriteLine("    -l <length>");
            Console.WriteLine("    -i <iterations>");
            Environment.Exit(1);
        }


        public void Run()
        {
            try
            {
                Console.WriteLine("AES encryptor (uses RFC2898 password-based key generator)");
                if (_password != null)
                {
                    Console.WriteLine("Password:          {0}", _password);
                    Console.WriteLine("Salt:              {0}", ByteArrayToHexString(_salt));
                    Console.WriteLine("iterations:        {0}", _iterations);
                }
                else
                    Console.WriteLine("key:               {0}", _keyHexString);
                    
                Console.WriteLine("iv:                {0}", ByteArrayToHexString(_iv));
                Console.WriteLine("key length:        {0} bytes", _keyLengthInBytes);
                Console.WriteLine("key length:        {0} bits", _keyLengthInBytes * 8);
                if (_plaintext != null)
                {
                    Console.WriteLine("plaintext:         {0}", _plaintext);
                    Console.WriteLine("plaintext.Length:  {0}", _plaintext.Length);
                }
                else 
                    Console.WriteLine("plaintext (hex):   {0}", _plaintextHexString);

                byte[] keyBytes = null;
                if (_password != null)
                {
                    System.Security.Cryptography.Rfc2898DeriveBytes rfc2898 =
                        new System.Security.Cryptography.Rfc2898DeriveBytes(_password, _salt, _iterations);

                    keyBytes = rfc2898.GetBytes(_keyLengthInBytes); // 16 or 24 or 32 ???
                }
                else
                    keyBytes = HexStringToByteArray(_keyHexString);
                
                Console.WriteLine("key:               {0}", ByteArrayToHexString(keyBytes));

                RijndaelManaged myRijndael = new RijndaelManaged();
                myRijndael.BlockSize = 128;
                myRijndael.KeySize = _keyLengthInBytes * 8;
                myRijndael.IV = _iv;
                myRijndael.Padding   = PaddingMode.None;  // PKCS7;
                myRijndael.Mode = CipherMode.CBC;
                myRijndael.Key = keyBytes;
    
                // Encrypt the string to an array of bytes.
                byte[] p = (_plaintext != null)
                    ? new System.Text.ASCIIEncoding().GetBytes(_plaintext)
                    : HexStringToByteArray(_plaintextHexString);
                
                ICryptoTransform transform = myRijndael.CreateEncryptor();
                byte[] cipherText = transform.TransformFinalBlock(p, 0, p.Length);

                Console.WriteLine("cipherText.length: {0}", cipherText.Length);
                Console.WriteLine("cipherText:        {0}", ByteArrayToHexString(cipherText));
            
                // Decrypt the bytes to a string.
                transform = myRijndael.CreateDecryptor();
                p = transform.TransformFinalBlock(cipherText, 0, cipherText.Length);

                if (_plaintext != null)
                {
                    string roundtrip = ascii.GetString(p);
                    Console.WriteLine("Round Trip:        {0}\n", roundtrip);

                    if (_plaintext != roundtrip)
                        Console.WriteLine("The roundtrip encrypt/decrypt was not successful.");
                    else
                        Console.WriteLine("The roundtrip encrypt/decrypt was successful.");
                }
                else
                {
                Console.WriteLine();
                    if (ByteArrayToHexString(p) != _plaintextHexString)
                        Console.WriteLine("The roundtrip encrypt/decrypt was not successful.");
                    else
                        Console.WriteLine("The roundtrip encrypt/decrypt was successful.");
                } 
    
            } 
            catch (Exception e)
            {
                Console.WriteLine("Error: {0}", e.Message);
                Console.WriteLine("{0}", e.StackTrace);
            }
        }



        internal static string ByteArrayToHexString(byte[] b)
        {
            System.Text.StringBuilder sb1 = new System.Text.StringBuilder();
            int i = 0;
            for (i = 0; i < b.Length; i++)
            {
                //if (i != 0 && i % 16 == 0) sb1.Append("\n");
                sb1.Append(System.String.Format("{0:X2}", b[i]));
            }
            return sb1.ToString().ToLower();
        }

        internal static byte[] HexStringToByteArray(string s)
        {
            var r= new byte[s.Length/2];
            for (int i = 0; i < s.Length; i+=2)
            {
                r[i/2] = (byte) Convert.ToInt32(s.Substring(i,2), 16);
            }
            return r;
        }
        
    }

}
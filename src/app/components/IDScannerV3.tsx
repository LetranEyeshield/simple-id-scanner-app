// pages/index.tsx

"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

export default function IDScannerV3() {
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) runOCR(imageSrc);
    console.log("Logs for imageSrc: ", imageSrc);
  };

  const runOCR = async (img: string) => {
    setLoading(true);
    setText("");

    try {
      const result = await Tesseract.recognize(img, "eng", {
        logger: (m) => console.log(m),
      });

      const extracted = result.data.text;
      setText(extracted);
      parseOCR(extracted);
      console.log("Logs for extracted: ", extracted);
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setLoading(false);
    }
  };

  //   const parseOCR = (raw: string) => {
  //     const lines = raw.toUpperCase().split("\n");

  //     lines.forEach((line, index) => {
  //       if (line.includes("JUAN") && line.includes("CRUZ")) {
  //         setFullName(line.trim());
  //       }

  //       if (line.includes("DOB") || line.includes("BIRTH")) {
  //         const match = line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/);
  //         if (match) setBirthDate(match[0]);
  //       }

  //       if (
  //         line.includes("STREET") ||
  //         line.includes("BRGY") ||
  //         line.includes("CITY")
  //       ) {
  //         const nextLine = lines[index + 1];
  //         if (nextLine && !nextLine.match(/NAME|DOB|SEX|ID|AGE/i)) {
  //           setAddress(nextLine.trim());
  //         }
  //       }
  //       console.log("Logs for lines: ", lines);
  //     });
  //   };

  const parseOCR = (raw: string) => {
    const lines = raw.toUpperCase().split("\n");

    lines.forEach((line, index) => {
      if (line.includes("NAME")) {
        setFullName(line.trim());
      }

      if (line.includes("DOB") || line.includes("BIRTH")) {
        const match = line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/);
        if (match) setBirthDate(match[0]);
      }

      if (
        line.includes("STREET") ||
        line.includes("BRGY") ||
        line.includes("CITY")
      ) {
        const nextLine = lines[index + 1];
        if (nextLine && !nextLine.match(/NAME|DOB|SEX|ID|AGE/i)) {
          setAddress(nextLine.trim());
        }
      }
      console.log("Logs for lines: ", lines);
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { fullName, birthDate, address };

    const res = await fetch("/api/patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Patient saved successfully!");
      // Optional: clear form or go to list
      clearForm();
    } else {
      alert("❌ Failed to save patient.");
    }
  };

  function clearForm() {
    setFullName("");
    setBirthDate("");
    setAddress("");
  }

  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">ID Scanner OCR</h1>

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        // videoConstraints={{
        //   width: { ideal: 1280 },
        //   height: { ideal: 720 },
        //   facingMode: { ideal: "environment" },
        // }}
        videoConstraints={{
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment",
        }}
        className="rounded-lg shadow-md w-full max-w-md"
      />

      <button
        onClick={captureImage}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Scan ID"}
      </button>

      {text && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 w-full max-w-md bg-white shadow-md rounded p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Birth Date</label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Submit
          </button>
        </form>
      )}
      <button
        type="button"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        onClick={clearForm}
      >
        Clear Form
      </button>
    </main>
  );
}

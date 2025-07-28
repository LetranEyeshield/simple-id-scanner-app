"use client";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

export default function IDScannerV2() {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      runOCR(imageSrc);
    }
  };

  const runOCR = async (img: string) => {
    setLoading(true);
    setText("");

    try {
      const result = await Tesseract.recognize(img, "eng", {
        logger: (m) => console.log(m),
      });
      setText(result.data.text);
      parseOCR(text);
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // const parseOCR = (raw: string) => {
  //   const lines = raw.toUpperCase().split("\n");

  //   for (const line of lines) {
  //     if (line.includes("JUAN") && line.includes("CRUZ")) {
  //       setFullName(line.trim());
  //     }

  //     if (line.includes("DOB") || line.includes("BIRTH")) {
  //       const match = line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/);
  //       if (match) setBirthDate(match[0]);
  //     }

  //     if (line.includes("STREET") || line.includes("BRGY") || line.includes("CITY")) {
  //       setAddress(line.trim());
  //     }
  //   }
  // };

  const parseOCR = (raw: string) => {
    const lines = raw
      .toUpperCase()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let nameFound = false;
    let addressFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // ✅ Full Name
      if (
        !nameFound &&
        (line.includes("NAME") || line.match(/^[A-Z]+\s[A-Z]+\s[A-Z]+$/))
      ) {
        // Handle label: NAME: JUAN DELA CRUZ
        const nameMatch = line.match(/NAME[:\-]?\s*(.+)/);
        if (nameMatch && nameMatch[1]) {
          setFullName(nameMatch[1].trim());
          nameFound = true;
        } else if (!line.includes(":") && line.split(" ").length >= 2) {
          setFullName(line.trim());
          nameFound = true;
        }
      }

      // ✅ Birth Date
      if (line.includes("BIRTH") || line.includes("DOB")) {
        const match = line.match(
          /\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}/
        );
        if (match) {
          setBirthDate(match[0]);
        }
      }

      // ✅ Address
      if (
        !addressFound &&
        (line.includes("ADDRESS") ||
          line.includes("STREET") ||
          line.includes("BRGY"))
      ) {
        const addressLine = line.includes(":")
          ? line.split(":")[1].trim()
          : line.trim();
        let fullAddress = addressLine;

        // Try to append the next 1–2 lines if they look like part of the address
        for (let j = 1; j <= 2; j++) {
          const nextLine = lines[i + j];
          if (nextLine && !nextLine.match(/NAME|BIRTH|DOB|ID/i)) {
            fullAddress += " " + nextLine.trim();
          }
        }

        setAddress(fullAddress.trim());
        addressFound = true;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } else {
      alert("❌ Failed to save patient.");
    }
  };

  {
    text && (
      //   <form
      //     className="mt-6 w-full max-w-md bg-white shadow-md rounded p-4 space-y-4"
      //     onSubmit={(e) => {
      //       e.preventDefault();
      //       console.log("Submitted Data:", { fullName, birthDate, address });
      //     }}
      //   >
      //     <h3 className="text-lg font-semibold">📝 Confirm Details</h3>

      //     <div>
      //       <label className="block text-sm font-medium">Full Name</label>
      //       <input
      //         type="text"
      //         className="w-full border px-3 py-2 rounded"
      //         value={fullName}
      //         onChange={(e) => setFullName(e.target.value)}
      //       />
      //     </div>

      //     <div>
      //       <label className="block text-sm font-medium">Birth Date</label>
      //       <input
      //         type="text"
      //         className="w-full border px-3 py-2 rounded"
      //         value={birthDate}
      //         onChange={(e) => setBirthDate(e.target.value)}
      //       />
      //     </div>

      //     <div>
      //       <label className="block text-sm font-medium">Address</label>
      //       <textarea
      //         className="w-full border px-3 py-2 rounded"
      //         value={address}
      //         onChange={(e) => setAddress(e.target.value)}
      //       />
      //     </div>

      //     <button
      //       type="submit"
      //       className="bg-green-600 text-white px-4 py-2 rounded w-full"
      //     >
      //       Submit
      //     </button>
      //   </form>
      <form
        className="mt-6 w-full max-w-md bg-white shadow-md rounded p-4 space-y-4"
        onSubmit={handleSubmit}
      >
        <h3 className="text-lg font-semibold">📝 Confirm Details</h3>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Birth Date</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Submit
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!image && (
        <>
          <div className="relative w-[300px] h-[180px] overflow-hidden rounded-lg border-2 border-dashed border-gray-400">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: { ideal: "environment" },
              }}
              className="absolute -top-[20%] -left-[10%] scale-[1.2] w-auto h-full"
            />
          </div>
          <button
            onClick={capture}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Capture ID
          </button>
        </>
      )}

      {image && (
        <div className="flex flex-col items-center">
          <img src={image} alt="Captured ID" className="w-[300px] rounded-md" />
          <button
            onClick={() => {
              setImage(null);
              setText("");
            }}
            className="mt-2 bg-gray-600 text-white px-3 py-1 rounded"
          >
            Retake
          </button>
        </div>
      )}

      {loading && <p>🧠 Scanning ID... Please wait.</p>}
      {text && (
        <div className="mt-4 w-full max-w-lg">
          <h2 className="text-lg font-semibold">📝 Extracted Text:</h2>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

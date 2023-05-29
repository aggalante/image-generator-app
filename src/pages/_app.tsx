import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import getConfig from "next/config";
import { Configuration, OpenAIApi } from "openai";
import "./App.css";

export default function App({ Component, pageProps }: AppProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1024px-Placeholder_view_vector.svg.png"
  );
  const [typedText, setTypedText] = useState("");
  const text = "Creating image... Please wait...";

  useEffect(() => {
    if (loading) {
      let i = 0;

      const typing = setInterval(() => {
        setTypedText(text.slice(0, i));
        i++;

        if (i > text.length + 1) {
          i = 0;
          setTypedText("");
        }
      }, 100);

      return () => clearInterval(typing);
    }
  }, [loading]);

  const { publicRuntimeConfig } = getConfig();
  const apiKey =
    typeof publicRuntimeConfig !== "undefined" && publicRuntimeConfig.apiKey
      ? publicRuntimeConfig.apiKey
      : process.env.API_KEY;

  if (!apiKey) {
    throw new Error("apiKey is not defined in config file");
  }

  const configuration = new Configuration({ apiKey });
  const openAi = new OpenAIApi(configuration);

  const generateImage = async () => {
    setLoading(true);
    try {
      const res = await openAi.createImage({
        prompt,
        n: 1,
        size: "512x512",
      });

      setResult(res.data.data[0].url || "no image found");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = () => {
    const url = result;
    const message = `Here's your image download link: ${url}`;
    window.location.href = `mailto:someone@example.com?subject=Generated Image Download Link&body=${message}`;
  };

  return (
    <div className="app-main">
      <h2>Create Images With Your Mind</h2>
      <textarea
        className="app-input"
        placeholder="Create any type of image you can think of with as much added description as you would like"
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={generateImage}>Generate Image</button>
      <>
        {loading ? (
          <>
            <h3>{typedText}</h3>
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </>
        ) : (
          <img
            src={result}
            alt="result"
            onClick={sendEmail}
            style={{ cursor: "pointer" }}
            className="result-image"
          />
        )}
      </>
    </div>
  );
}

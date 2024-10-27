/* eslint-disable @next/next/no-img-element */
"use client";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload, X } from "lucide-react";
import { useS3Upload } from "next-s3-upload";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { code: "th", name: "Thai" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "pt", name: "Portuguese" }
];

const models = [
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
  },
  {
    value: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    label: "Llama 3.2 11B",
    provider: "together",
  },
  {
    value: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
    label: "Llama 3.2 90B",
    provider: "together",
  }
];

const lengths = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "formal", label: "Formal" },
];

const promptBackgrounds = [
  { value: "the sun", label: "The Sun" },
  { value: "an old castle", label: "Old Castle" },
  { value: "a tropical beach", label: "Tropical Beach" },
  { value: "a snowy mountain", label: "Snowy Mountain" },
  { value: "a bustling city", label: "Bustling City" },
  { value: "a serene lake", label: "Serene Lake" },
  { value: "a lush forest", label: "Lush Forest" },
  { value: "a desert oasis", label: "Desert Oasis" },
  { value: "a starry night sky", label: "Starry Night Sky" },
  { value: "an underwater coral reef", label: "Underwater Coral Reef" },
];

export default function Page() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<
    { language: string; description: string; productName: string }[]
  >([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [model, setModel] = useState(models[0].value);
  const [length, setLength] = useState(lengths[0].value);
  const [tone, setTone] = useState(tones[0].value);
  const [replacedBgImage, setReplacedBgImage] = useState<string | null>(null);
  const [isReplacingBackground, setIsReplacingBackground] = useState(false);
  const [backgroundPrompt, setBackgroundPrompt] = useState("");

  const { uploadToS3 } = useS3Upload();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const { url } = await uploadToS3(file);
    setImage(url);
  };

  const handleSubmit = async () => {
    if (!image || selectedLanguages.length === 0) return;
  
    setStatus("loading");
  
    const selectedModel = models.find((m) => m.value === model);
    const endpoint = selectedModel?.provider === "openai" 
      ? "/api/openai"
      : "/api/together";
  
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        languages: selectedLanguages,
        imageUrl: image,
        model,
        length,
        tone,
      }),
    });
  
    const data = await response.json();
    console.log(data);
  
    setDescriptions(data.descriptions.map((desc: { language: string; description: string }) => ({
      ...desc,
      productName: data.productNames[desc.language] || data.productName
    })));
    setStatus("success");
  };

  const handleReplaceBackground = async () => {
    if (!image) return;

    setIsReplacingBackground(true);
    try {
      const response = await fetch("/api/replace-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: image,
          prompt: backgroundPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to replace background");
      }

      const data = await response.json();
      if (data.success) {
        setReplacedBgImage(data.imageUrl);
      } else {
        console.error("Error replacing background:", data.error);
      }
    } catch (error) {
      console.error("Error replacing background:", error);
    } finally {
      setIsReplacingBackground(false);
    }
  };

  return (
    <div className="mx-auto my-12 grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-2">
      <Card className="mx-auto w-full max-w-xl p-6">
        <h2 className="mb-1 text-center text-2xl font-bold">
          🎨 AI Product Description & Image Generator
        </h2>
        <p className="mb-6 text-balance text-center text-sm text-gray-500">
          Upload a product image to generate multilingual descriptions, product names, and background replacements.
        </p>
        <div>
          <div
            className={`${image ? "border-transparent" : "transition-colors hover:border-primary"} my-4 flex aspect-[3] flex-col items-center justify-center rounded-lg border-2 border-dashed`}
          >
            {image ? (
              <div className="relative flex h-full max-h-full w-full items-center justify-center">
                <img
                  src={image}
                  alt="Uploaded product"
                  className="h-full rounded"
                />
                <Button
                  variant="default"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Label
                htmlFor="image-upload"
                className="flex w-full grow cursor-pointer items-center justify-center"
              >
                <div className="flex flex-col items-center">
                  <Upload className="mb-2 h-8 w-8" />
                  <span>Upload product image</span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </Label>
            )}
          </div>
          <div className={`${image ? "invisible" : ""} text-right`}>
            <button
              onClick={() =>
                setImage(
                  "https://napkinsdev.s3.us-east-1.amazonaws.com/next-s3-uploads/91061dca-cebc-4215-ab2c-8bde6cb46cac/trader-wafer.JPG",
                )
              }
              className="text-xs font-semibold text-blue-400 hover:text-blue-500"
            >
              Use a sample image
            </button>
          </div>

          <div className="divide-y">
            <div className="grid grid-cols-2 py-7">
              <div>
                <p className="text-sm font-bold text-gray-900">AI Model</p>
                <p className="mt-2 text-sm text-gray-500">
                  Choose the AI model for generating descriptions.
                </p>
              </div>
              <ToggleGroup
                type="single"
                className="mx-auto flex flex-wrap justify-start gap-2"
                onValueChange={setModel}
                value={model}
              >
                {models.map((model) => (
                  <ToggleGroupItem
                    variant="outline"
                    key={model.value}
                    value={model.value}
                    className="rounded-full px-3 py-1 text-xs font-medium shadow-none data-[state=on]:bg-black data-[state=on]:text-white"
                  >
                    {model.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-2 py-7">
              <div>
                <p className="text-sm font-bold text-gray-900">Target Languages</p>
                <p className="mt-2 text-sm text-gray-500">
                  Select up to 3 languages for product descriptions.
                </p>
              </div>
              <ToggleGroup
                type="multiple"
                className="mx-auto flex flex-wrap justify-start gap-2"
                onValueChange={setSelectedLanguages}
              >
                {languages.map((lang) => (
                  <ToggleGroupItem
                    variant="outline"
                    key={lang.code}
                    value={lang.code}
                    disabled={
                      selectedLanguages.length === 3 &&
                      !selectedLanguages.includes(lang.code)
                    }
                    className="rounded-full px-3 py-1 text-xs font-medium shadow-none data-[state=on]:bg-black data-[state=on]:text-white"
                  >
                    {lang.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-2 py-7">
              <div>
                <p className="text-sm font-bold text-gray-900">Description Length</p>
                <p className="mt-2 text-sm text-gray-500">
                  Choose the desired length for product descriptions.
                </p>
              </div>
              <ToggleGroup
                type="single"
                className="mx-auto flex flex-wrap justify-start gap-2"
                onValueChange={setLength}
                value={length}
              >
                {lengths.map((model) => (
                  <ToggleGroupItem
                    variant="outline"
                    key={model.value}
                    value={model.value}
                    className="rounded-full px-3 py-1 text-xs font-medium shadow-none data-[state=on]:bg-black data-[state=on]:text-white"
                  >
                    {model.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-2 py-7">
              <div>
                <p className="text-sm font-bold text-gray-900">Description Tone</p>
                <p className="mt-2 text-sm text-gray-500">
                  Select the tone for product descriptions.
                </p>
              </div>
              <ToggleGroup
                type="single"
                className="mx-auto flex flex-wrap justify-start gap-2"
                onValueChange={setTone}
                value={tone}
              >
                {tones.map((toneOption) => (
                  <ToggleGroupItem
                    variant="outline"
                    key={toneOption.value}
                    value={toneOption.value}
                    className="rounded-full px-3 py-1 text-xs font-medium shadow-none data-[state=on]:bg-black data-[state=on]:text-white"
                  >
                    {toneOption.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="mt-10 text-right">
            <Button
              onClick={handleSubmit}
              disabled={
                !image || selectedLanguages.length === 0 || status === "loading"
              }
              className="relative"
            >
              <span
                className={`${
                  status === "loading" ? "opacity-0" : "opacity-100"
                } whitespace-pre-wrap text-center font-semibold leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10`}
              >
                Generate Content
              </span>

              {status === "loading" && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <Spinner className="size-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {status === "idle" ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-gray-50 lg:h-auto">
          <p className="text-center text-xl text-gray-500">
            Generated content will appear here.
          </p>
        </div>
      ) : (
        <Card className="mx-auto w-full max-w-xl p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">AI-Generated Content</h3>
            {status === "loading" ? (
              <div className="space-y-8">
                {selectedLanguages.map((language) => (
                  <div className="flex flex-col space-y-3" key={language}>
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton
                      className={`${
                        length === "short"
                          ? "h-12"
                          : length === "medium"
                            ? "h-20"
                            : "h-32"
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {descriptions.map(({ language, description, productName }) => (
                  <div key={language}>
                    <h4 className="font-medium">
                      {languages.find((l) => l.code === language)?.name}
                    </h4>
                    <p className="mt-1 text-sm font-semibold">Product Name: {productName}</p>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </>
            )}
            <div className="mt-6">
              <h4 className="text-lg font-semibold">Background Replacement</h4>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={backgroundPrompt}
                  onChange={(e) => setBackgroundPrompt(e.target.value)}
                  placeholder="Describe new background"
                  className="flex-grow rounded-md border p-2"
                />
                <Select onValueChange={(value) => setBackgroundPrompt(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Quick select" />
                  </SelectTrigger>
                  <SelectContent>
                    {promptBackgrounds.map((bg) => (
                      <SelectItem key={bg.value} value={bg.value}>
                        {bg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleReplaceBackground}
                disabled={isReplacingBackground || !backgroundPrompt}
                className="mt-2"
              >
                {isReplacingBackground ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  "Replace Background"
                )}
              </Button>
              {isReplacingBackground && (
                <div className="mt-4 flex items-center justify-center">
                  <Spinner className="h-8 w-8" />
                  <span className="ml-2">Creating new image...</span>
                </div>
              )}
              {replacedBgImage ? (
                <div className="mt-4">
                  <img 
                    src={replacedBgImage} 
                    alt="Product with new background" 
                    className="rounded-lg" 
                    onLoad={() => setIsReplacingBackground(false)}
                  />
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = replacedBgImage;
                      link.download = 'product-with-new-background.jpg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mt-2"
                  >
                    Download Image
                  </Button>
                </div>
              ) : isReplacingBackground && (
                <div className="mt-4 flex items-center justify-center">
                  <Spinner className="h-8 w-8" />
                  <span className="ml-2">Creating new image...</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

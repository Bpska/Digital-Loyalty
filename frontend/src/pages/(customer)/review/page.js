import { useNavigate, useSearchParams } from "react-router-dom";
"use client";

import React, { useState, useEffect } from "react";
import { api, getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, Copy, ExternalLink, ArrowLeft, Check, Sparkles } from "lucide-react";

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  const [business, setBusiness] = useState(null);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [step, setStep] = useState("rating"); // rating, generating, suggestions, selected
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [generationId, setGenerationId] = useState("");
  const [selectedReview, setSelectedReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [generatingError, setGeneratingError] = useState(null);

  // Fetch business details
  useEffect(() => {
    if (!businessId) {
      setLoadingBiz(false);
      return;
    }
    setLoadingBiz(true);
    api.get(`/reviews/business-details/${businessId}`)
      .then((res) => {
        if (res && res.data) {
          setBusiness(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load business details:", err);
      })
      .finally(() => {
        setLoadingBiz(false);
      });
  }, [businessId]);

  // Handle rating click - transition to generation
  const handleRatingSelect = async (selectedRating) => {
    setRating(selectedRating);
    setStep("generating");
    setGeneratingError(null);

    try {
      const res = await api.post("/reviews/generate", {
        businessId,
        rating: selectedRating,
      });

      if (res && res.data) {
        setSuggestions(res.data.reviews || []);
        setGenerationId(res.data.generationId || "");
        setStep("suggestions");
      } else {
        throw new Error("Failed to generate reviews suggestions");
      }
    } catch (err) {
      console.error("Error generating reviews:", err);
      setGeneratingError(err.message || "Failed to generate suggestions. Please try again.");
      setStep("rating");
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (reviewText) => {
    setSelectedReview(reviewText);
    setStep("selected");

    if (generationId) {
      try {
        await api.post("/reviews/track-selection", {
          reviewGenerationId: generationId,
          selectedReview: reviewText,
        });
      } catch (err) {
        console.error("Failed to track selection:", err);
      }
    }
  };

  // Copy to clipboard helper
  const handleCopyReview = () => {
    navigator.clipboard.writeText(selectedReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Google Reviews link
  const handleOpenGoogle = async () => {
    if (generationId) {
      try {
        await api.post("/reviews/track-click", {
          reviewGenerationId: generationId,
        });
      } catch (err) {
        console.error("Failed to track Google link click:", err);
      }
    }

    const url = business?.googleReviewUrl || "https://google.com";
    window.open(url.startsWith("http") ? url : `https://${url}`, "_blank", "noopener,noreferrer");
  };

  // Back button helper
  const handleBack = () => {
    if (step === "selected") {
      setStep("suggestions");
    } else if (step === "suggestions") {
      setStep("rating");
      setRating(0);
    } else {
      navigate("/dashboard");
    }
  };

  if (loadingBiz) {
    return React.createElement('div', { className: "max-w-sm mx-auto text-center py-20" },
      React.createElement(Loader2, { className: "h-10 w-10 animate-spin text-primary mx-auto" }),
      React.createElement('p', { className: "text-xs text-muted-foreground mt-4" }, "Loading brand experience...")
    );
  }

  if (!businessId || (!loadingBiz && !business)) {
    return React.createElement(Card, { className: "max-w-sm mx-auto p-6 text-center border-red-100 bg-red-50/20", glass: true },
      React.createElement(CardContent, { className: "pt-6 flex flex-col items-center justify-center space-y-4" },
        React.createElement('div', { className: "h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold" }, "!"),
        React.createElement(CardTitle, { className: "text-lg font-bold" }, "Invalid Request"),
        React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "No business ID was provided or this business was not found."),
        React.createElement(Button, { className: "w-full rounded-full", onClick: () => navigate("/dashboard") }, "Back to Dashboard")
      )
    );
  }

  return React.createElement('div', { className: "space-y-6 max-w-sm mx-auto" },
    /* Header section with brand info */
    React.createElement('div', { className: "flex items-center space-x-3 pb-2" },
      React.createElement(Button, { variant: "ghost", size: "icon", className: "rounded-full h-8 w-8", onClick: handleBack },
        React.createElement(ArrowLeft, { className: "h-4 w-4" })
      ),
      business.logoUrl ? React.createElement('img', {
        src: getImageUrl(business.logoUrl),
        alt: business.name,
        className: "h-9 w-9 rounded-full object-cover border border-border"
      }) : React.createElement('div', {
        className: "h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-indigo-100 flex items-center justify-center font-bold text-primary border border-border text-xs"
      }, business.name[0]),
      React.createElement('div', { className: "min-w-0" },
        React.createElement('h3', { className: "text-sm font-black text-foreground truncate" }, business.name),
        React.createElement('p', { className: "text-[10px] text-muted-foreground" }, "Rate & Share Suggestions")
      )
    ),

    /* Step 1: Star Rating Selector */
    step === "rating" ? React.createElement(Card, { className: "glass p-6 text-center shadow-md border-border/40", glass: true },
      React.createElement(CardContent, { className: "space-y-6 pt-4" },
        React.createElement('div', { className: "space-y-2" },
          React.createElement('h2', { className: "text-lg font-extrabold text-foreground" }, "Rate Your Experience"),
          React.createElement('p', { className: "text-xs text-muted-foreground" }, "How would you rate your visit to " + business.name + "?")
        ),
        React.createElement('div', { className: "flex items-center justify-center gap-2 py-4" },
          [1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverRating || rating);
            return React.createElement(Star, {
              key: star,
              className: `h-10 w-10 cursor-pointer transition-all duration-200 hover:scale-125 ${
                active ? "text-amber-500 fill-amber-500" : "text-slate-300 stroke-[1.5]"
              }`,
              onMouseEnter: () => setHoverRating(star),
              onMouseLeave: () => setHoverRating(0),
              onClick: () => handleRatingSelect(star)
            });
          })
        ),
        generatingError ? React.createElement('p', { className: "text-xs text-destructive text-center" }, generatingError) : null,
        React.createElement('p', { className: "text-[10px] text-muted-foreground text-center" }, "Selecting a rating generates personalized review suggestions powered by AI.")
      )
    ) : null,

    /* Step 2: Generating suggestions */
    step === "generating" ? React.createElement(Card, { className: "glass p-6 text-center border-border/40", glass: true },
      React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-6 pt-4" },
        React.createElement('div', { className: "relative flex items-center justify-center" },
          React.createElement('div', { className: "absolute h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" }),
          React.createElement(Sparkles, { className: "h-6 w-6 text-primary animate-pulse" })
        ),
        React.createElement('div', { className: "space-y-1.5" },
          React.createElement(CardTitle, { className: "text-sm text-foreground font-extrabold" }, "Generating Review Suggestions..."),
          React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Our AI is crafting 5 unique feedback options for you.")
        )
      )
    ) : null,

    /* Step 3: suggestions list */
    step === "suggestions" ? React.createElement('div', { className: "space-y-4 animate-fade-in" },
      React.createElement('div', { className: "space-y-1" },
        React.createElement('h2', { className: "text-base font-extrabold text-foreground" }, "AI Suggested Reviews"),
        React.createElement('p', { className: "text-xs text-muted-foreground" }, "We crafted these based on your " + rating + "-star rating. Choose one to continue:")
      ),
      React.createElement('div', { className: "space-y-3" },
        suggestions.map((text, idx) =>
          React.createElement(Card, { key: idx, className: "border-border/60 bg-white hover:border-primary/40 transition-colors shadow-sm rounded-xl overflow-hidden" },
            React.createElement(CardContent, { className: "p-4 space-y-3" },
              React.createElement('p', { className: "text-xs text-slate-700 leading-relaxed font-medium italic" }, `"${text}"`),
              React.createElement(Button, {
                className: "w-full bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-full text-xs font-bold h-9 transition-colors",
                onClick: () => handleSelectSuggestion(text)
              }, "Use This Review")
            )
          )
        )
      )
    ) : null,

    /* Step 4: Selected suggestion actions & final instructions */
    step === "selected" ? React.createElement('div', { className: "space-y-6 animate-fade-in" },
      React.createElement(Card, { className: "border-emerald-100 bg-emerald-50/20 p-6 text-center rounded-xl", glass: true },
        React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4" },
          React.createElement('div', { className: "h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm" },
            React.createElement(Check, { className: "h-6 w-6" })
          ),
          React.createElement('div', { className: "space-y-1" },
            React.createElement(CardTitle, { className: "text-base font-extrabold text-foreground" }, "Review Suggestion Selected!"),
            React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Follow the simple steps below to share your experience on Google:")
          )
        )
      ),

      /* Clipboard Copy Card */
      React.createElement(Card, { className: "border-border bg-white shadow-md rounded-xl" },
        React.createElement(CardContent, { className: "p-4 space-y-4" },
          React.createElement('div', { className: "bg-slate-50 border border-border/60 rounded-xl p-4 relative" },
            React.createElement('p', { className: "text-xs text-slate-700 leading-relaxed font-semibold italic select-all" }, `"${selectedReview}"`),
            React.createElement('div', { className: "absolute top-2 right-2" },
              React.createElement('span', { className: "text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" }, rating + " Stars")
            )
          ),
          React.createElement('div', { className: "flex flex-col gap-2.5" },
            React.createElement(Button, {
              className: "w-full rounded-full text-xs font-bold h-11 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
              onClick: handleCopyReview
            },
              copied ? React.createElement(Check, { className: "mr-2 h-4 w-4" }) : React.createElement(Copy, { className: "mr-2 h-4 w-4" }),
              copied ? "Review Copied!" : "1. Copy Review Text"
            ),
            React.createElement(Button, {
              variant: "outline",
              className: "w-full rounded-full text-xs font-bold h-11 flex items-center justify-center border-emerald-600 text-emerald-700 hover:bg-emerald-50",
              onClick: handleOpenGoogle
            },
              React.createElement(ExternalLink, { className: "mr-2 h-4 w-4" }),
              "2. Open Google Reviews"
            )
          )
        )
      ),

      /* Optional Social Follows if configured */
      (business.instagramUrl || business.facebookUrl) ? React.createElement(Card, { className: "bg-slate-50/40 border-border/50 rounded-xl", glass: true },
        React.createElement(CardContent, { className: "p-4 text-center space-y-3" },
          React.createElement('p', { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Also connect with us on"),
          React.createElement('div', { className: "flex items-center justify-center gap-3" },
            business.instagramUrl ? React.createElement('a', {
              href: business.instagramUrl.startsWith("http") ? business.instagramUrl : `https://${business.instagramUrl}`,
              target: "_blank", rel: "noopener noreferrer",
              className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white shadow-sm hover:scale-105 transition-transform"
            },
              React.createElement('span', null, "Instagram")
            ) : null,
            business.facebookUrl ? React.createElement('a', {
              href: business.facebookUrl.startsWith("http") ? business.facebookUrl : `https://${business.facebookUrl}`,
              target: "_blank", rel: "noopener noreferrer",
              className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#1877F2] text-white shadow-sm hover:scale-105 transition-transform"
            },
              React.createElement('span', null, "Facebook")
            ) : null
          )
        )
      ) : null,

      /* Go to Dashboard */
      React.createElement(Button, {
        variant: "ghost",
        className: "w-full rounded-full text-xs text-muted-foreground hover:text-foreground",
        onClick: () => navigate("/dashboard")
      }, "Finished · Go to Dashboard")
    ) : null
  );
}

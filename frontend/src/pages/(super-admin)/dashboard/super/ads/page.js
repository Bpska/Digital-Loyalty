import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Megaphone, Upload, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdsManagementPage() {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);
  const [previewImage, setPreviewImage] = React.useState(null);
  const [statusMsg, setStatusMsg] = React.useState(null);

  // Fetch current banners
  const { data: adData, isLoading } = useQuery({
    queryKey: ["adminAdBanners"],
    queryFn: () => api.get("/admin/ads").then((res) => res.data),
  });

  const banners = adData?.banners || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (base64) => api.post("/admin/ads", { bannerImage: base64 }),
    onSuccess: () => {
      setStatusMsg({ success: true, text: "Banner uploaded successfully! It is now live." });
      setPreviewImage(null);
      queryClient.invalidateQueries(["adminAdBanners"]);
    },
    onError: (err) => {
      setStatusMsg({ success: false, text: err?.response?.data?.message || "Upload failed. Please try again." });
    },
  });

  // Delete mutation for a specific index
  const deleteMutation = useMutation({
    mutationFn: (index) => api.delete(`/admin/ads/${index}`),
    onSuccess: () => {
      setStatusMsg({ success: true, text: "Banner removed successfully." });
      queryClient.invalidateQueries(["adminAdBanners"]);
    },
    onError: (err) => {
      setStatusMsg({ success: false, text: err?.response?.data?.message || "Delete failed." });
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMsg(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!previewImage) return;
    uploadMutation.mutate(previewImage);
  };

  const handleDelete = (index) => {
    if (!window.confirm("Remove this banner? It will no longer show on the business dashboard.")) return;
    deleteMutation.mutate(index);
  };

  return (
    React.createElement('div', { className: "space-y-8 animate-fade-in" }
      , React.createElement('div', null
        , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight" }, "Advertisement Management")
        , React.createElement('p', { className: "text-xs text-muted-foreground mt-1" },
          "Upload multiple banner images here. They will display as a responsive, auto-rotating carousel on the business dashboard."
        )
      )

      /* Current Live Banners */
      , React.createElement(Card, { className: "glass border-emerald-500/20 bg-gradient-to-tr from-white to-emerald-50/20" }
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base flex items-center gap-2" }
            , React.createElement(CheckCircle, { className: "h-4 w-4 text-emerald-600" })
            , "Currently Live Banners (" + banners.length + ")"
          )
          , React.createElement(CardDescription, { className: "text-xs" }, "These banners are currently displayed on the business dashboards.")
        )
        , React.createElement(CardContent, null
          , isLoading
            ? React.createElement('div', { className: "flex items-center gap-2 text-xs text-muted-foreground py-4" }
                , React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                , "Loading banners..."
              )
            : banners.length > 0
              ? React.createElement('div', { className: "grid grid-cols-1 gap-6" }
                  , banners.map((banner, index) => 
                      React.createElement('div', { key: index, className: "space-y-2 border border-zinc-200/60 p-3 rounded-2xl bg-white/50" }
                        , React.createElement('div', { className: "relative w-full aspect-[4/1] md:aspect-[5/1] overflow-hidden rounded-xl border border-zinc-200 shadow-sm" }
                          , React.createElement('img', {
                              src: banner,
                              alt: "Ad Banner " + (index + 1),
                              className: "w-full h-full object-cover"
                            })
                        )
                        , React.createElement('div', { className: "flex justify-between items-center px-1" }
                          , React.createElement('span', { className: "text-xs font-semibold text-slate-500" }, "Position: #" + (index + 1))
                          , React.createElement(Button, {
                              type: "button",
                              onClick: () => handleDelete(index),
                              disabled: deleteMutation.isPending,
                              className: "flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border-0 transition-colors"
                            }
                              , deleteMutation.isPending
                                ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" })
                                : React.createElement(Trash2, { className: "h-3.5 w-3.5" })
                              , "Remove"
                            )
                        )
                      )
                    )
                )
              : React.createElement('p', { className: "text-xs text-muted-foreground py-4 text-center italic" },
                  "No banners uploaded yet. Upload one below to show it on the business dashboard."
                )
        )
      )

      /* Upload New Banner */
      , React.createElement(Card, { className: "glass border-blue-500/20 bg-gradient-to-tr from-white to-blue-50/20" }
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base flex items-center gap-2" }
            , React.createElement(Megaphone, { className: "h-4 w-4 text-blue-600" })
            , "Upload New Banner"
          )
          , React.createElement(CardDescription, { className: "text-xs" },
            "Select an image to add to the carousel. Recommended size: 1200x300px (4:1 or 5:1 ratio). PNG or JPG."
          )
        )
        , React.createElement(CardContent, { className: "space-y-5" }

          /* Drop zone */
          , React.createElement('div', { className: "space-y-1.5" }
            , React.createElement(Label, { className: "text-xs font-bold text-muted-foreground" }, "Banner Image")
            , React.createElement('div', {
              onClick: () => fileInputRef.current?.click(),
              className: "border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors"
            }
              , previewImage
                ? React.createElement('div', { className: "w-full aspect-[4/1] md:aspect-[5/1] overflow-hidden rounded-xl border border-zinc-200 shadow-sm mb-3" }
                    , React.createElement('img', {
                        src: previewImage,
                        alt: "Preview",
                        className: "w-full h-full object-cover"
                      })
                  )
                : React.createElement(Upload, { className: "h-6 w-6 text-muted-foreground mb-2" })
              , React.createElement('span', { className: "text-xs font-bold text-slate-700" },
                previewImage ? "Click to change image" : "Click to select banner image"
              )
              , React.createElement('span', { className: "text-[10px] text-muted-foreground mt-1" }, "Recommended size: 1200x300px")
            )
            , React.createElement('input', {
              ref: fileInputRef,
              type: "file",
              accept: "image/*",
              onChange: handleFileChange,
              className: "hidden"
            })
          )

          /* Status message */
          , statusMsg && React.createElement('div', {
              className: `text-xs px-3 py-2 rounded-lg border ${
                statusMsg.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`
            }, statusMsg.text)

          /* Actions */
          , React.createElement('div', { className: "flex justify-end gap-3" }
            , previewImage && React.createElement(Button, {
                type: "button",
                onClick: () => { setPreviewImage(null); setStatusMsg(null); },
                className: "text-xs font-bold px-4 py-2 rounded-xl border bg-white text-slate-600 hover:bg-slate-50"
              }, "Cancel")
            , React.createElement(Button, {
                type: "button",
                onClick: handleUpload,
                disabled: !previewImage || uploadMutation.isPending,
                className: "bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              }
              , uploadMutation.isPending
                ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" })
                : React.createElement(Upload, { className: "h-3.5 w-3.5" })
              , uploadMutation.isPending ? "Uploading..." : "Publish Banner"
            )
          )
        )
      )
    )
  );
}

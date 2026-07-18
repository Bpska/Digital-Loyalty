import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Download, 
  Printer, 
  Smartphone, 
  Loader2, 
  Check, 
  Eye, 
  MapPin, 
  Phone, 
  Info,
  QrCode,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { api, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function QRPosterDesigner() {
  const [data, setData] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get settings (which also returns business info and branches)
      const res = await api.get('/posters/settings');
      const backendData = res.data;
      setData(backendData);
      
      // Auto-select first branch if available
      if (backendData.branches?.length > 0) {
        setSelectedBranchId(backendData.branches[0].id);
      }

      // Fetch templates matching the business category
      const category = backendData.business?.category || "Café";
      const tplRes = await api.get(`/posters/templates?category=${encodeURIComponent(category)}`);
      setTemplates(tplRes.data);

      // Set initially selected template
      if (backendData.template) {
        setSelectedTemplate(backendData.template);
      } else if (tplRes.data?.length > 0) {
        // Fallback to first matching template if none saved
        setSelectedTemplate(tplRes.data[0]);
      }
    } catch (err) {
      console.error("Failed to load poster data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectTemplate = async (tpl) => {
    setSavingId(tpl.id);
    try {
      await api.put('/posters/settings', { selectedTemplateId: tpl.id });
      setSelectedTemplate(tpl);
    } catch (err) {
      alert("Failed to save template selection");
    } finally {
      setSavingId(null);
    }
  };

  const getActiveBranch = () => {
    if (!data?.branches) return null;
    return data.branches.find(b => b.id === selectedBranchId) || data.branches[0];
  };

  // Helper to draw the poster onto a high-res canvas for downloading
  const drawPosterToCanvas = (width = 1200, height = 1680) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || !selectedTemplate || !data?.business) return resolve(null);

      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Parse gradient or image background
      const bgStyle = selectedTemplate.backgroundImage || "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)";
      const isImgBg = bgStyle.startsWith('/uploads');

      // Coordinate helper
      const getX = (val) => (val / 100) * width;
      const getY = (val) => (val / 100) * height;

      // Extract positions
      const logoPos = selectedTemplate.logoPosition || { x: 50, y: 15, w: 20 };
      const qrPos = selectedTemplate.qrPosition || { x: 50, y: 62, w: 32 };
      const namePos = selectedTemplate.businessNamePosition || { x: 50, y: 40, fontSize: 26, color: "#0F172A" };
      const phonePos = selectedTemplate.phonePosition || { x: 50, y: 86, fontSize: 14, color: "#475569" };
      const addressPos = selectedTemplate.addressPosition || { x: 50, y: 91, fontSize: 12, color: "#64748B" };
      const taglinePos = selectedTemplate.taglinePosition || { x: 50, y: 28, fontSize: 13, color: "#6F4E37" };
      const bannerPos = selectedTemplate.bannerPosition || { x: 50, y: 46, fontSize: 11, color: "#FFFFFF", bgColor: "#7B3F00" };
      const featuresPos = selectedTemplate.featuresPosition || { x: 50, y: 95, fontSize: 10, color: "#FFFFFF", bgColor: "#4A2c11" };
      const benefitsPos = selectedTemplate.benefitsPosition || { x: 82, y: 72, fontSize: 9, color: "#3E2723" };
      const brandingText = selectedTemplate.brandingText || "Powered by Logisaar Technologies Pvt Ltd";

      const branch = getActiveBranch();

      // Load Images
      const imagesToLoad = [];
      let logoImg = null;
      let qrImg = null;
      let bgImg = null;

      // Background Image
      if (isImgBg) {
        bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = getImageUrl(bgStyle);
        imagesToLoad.push(new Promise((res) => {
          bgImg.onload = () => res(true);
          bgImg.onerror = () => res(false);
        }));
      }

      // Logo Image
      if (data.business.logoUrl) {
        logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = getImageUrl(data.business.logoUrl);
        imagesToLoad.push(new Promise((res) => {
          logoImg.onload = () => res(true);
          logoImg.onerror = () => res(false);
        }));
      }

      // QR Image
      if (branch?.qrImage) {
        qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.src = branch.qrImage;
        imagesToLoad.push(new Promise((res) => {
          qrImg.onload = () => res(true);
          qrImg.onerror = () => res(false);
        }));
      }

      // Draw all after image load completes
      Promise.all(imagesToLoad).then(() => {
        // Draw background first
        if (isImgBg && bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, width, height);
        } else {
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          if (bgStyle.includes('linear-gradient')) {
            const colors = bgStyle.match(/#[a-fA-F0-9]{3,8}/g);
            if (colors && colors.length >= 2) {
              gradient.addColorStop(0, colors[0]);
              gradient.addColorStop(1, colors[1]);
            } else {
              gradient.addColorStop(0, '#FFF7ED');
              gradient.addColorStop(1, '#FFEDD5');
            }
          } else {
            gradient.addColorStop(0, '#FFF7ED');
            gradient.addColorStop(1, '#FFEDD5');
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
        // 1. Draw Logo
        if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
          const size = (logoPos.w / 100) * width;
          const x = getX(logoPos.x) - size / 2;
          const y = getY(logoPos.y) - size / 2;

          // Draw rounded card wrapper for logo
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.06)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetY = 5;
          ctx.fillStyle = '#FFFFFF';
          // Draw rounded rect
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, 20);
          ctx.fill();
          ctx.restore();

          // Clip logo inside card
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x + 10, y + 10, size - 20, size - 20, 15);
          ctx.clip();
          ctx.drawImage(logoImg, x + 10, y + 10, size - 20, size - 20);
          ctx.restore();
        }

        // 2. Draw Business Name
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = namePos.color || '#0F172A';
        ctx.font = `bold ${Math.round(namePos.fontSize * 1.5)}px sans-serif`;
        ctx.fillText(data.business.name || "Business Name", getX(namePos.x), getY(namePos.y));
        ctx.restore();

        // 3. Draw QR Code
        if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
          const size = (qrPos.w / 100) * width;
          const x = getX(qrPos.x) - size / 2;
          const y = getY(qrPos.y) - size / 2;

          // Draw rounded card wrapper for QR
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.08)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 8;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, 24);
          ctx.fill();
          ctx.restore();

          // Draw QR inside card
          ctx.drawImage(qrImg, x + 16, y + 16, size - 32, size - 32);
        }

        // 4. Draw Phone
        if (data.business.phone) {
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = phonePos.color || '#475569';
          ctx.font = `600 ${Math.round(phonePos.fontSize * 1.5)}px sans-serif`;
          ctx.fillText(`📞  ${data.business.phone}`, getX(phonePos.x), getY(phonePos.y));
          ctx.restore();
        }

        // 5. Draw Address
        if (data.business.address) {
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = addressPos.color || '#64748B';
          ctx.font = `${Math.round(addressPos.fontSize * 1.5)}px sans-serif`;
          ctx.fillText(`📍  ${data.business.address}`, getX(addressPos.x), getY(addressPos.y));
          ctx.restore();
        }

        // Draw Tagline
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = taglinePos.color || '#6F4E37';
        ctx.font = `italic 500 ${Math.round(taglinePos.fontSize * 1.5)}px sans-serif`;
        ctx.fillText(`✨ Comfort. Convenience. Hospitality. ✨`, getX(taglinePos.x), getY(taglinePos.y));
        ctx.restore();

        // Draw Banner
        ctx.save();
        const bannerW = width * 0.72;
        const bannerH = 70;
        const bannerXCoord = getX(bannerPos.x) - bannerW / 2;
        const bannerYCoord = getY(bannerPos.y) - bannerH / 2;
        ctx.fillStyle = bannerPos.bgColor || '#7B3F00';
        ctx.beginPath();
        ctx.roundRect(bannerXCoord, bannerYCoord, bannerW, bannerH, 15);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = bannerPos.color || '#FFFFFF';
        ctx.font = `bold ${Math.round(bannerPos.fontSize * 1.5)}px sans-serif`;
        ctx.fillText("Scan this QR code with your phone camera to check-in!", getX(bannerPos.x), getY(bannerPos.y));
        ctx.restore();

        // Draw Benefits Sidebar
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = benefitsPos.color || '#3E2723';
        ctx.font = `bold ${Math.round(benefitsPos.fontSize * 1.5)}px sans-serif`;
        const benefitsList = [
          { title: "EARN POINTS", desc: "Every time you visit" },
          { title: "EXCLUSIVE", desc: "Member Benefits" },
          { title: "SPECIAL OFFERS", desc: "Just for you" },
          { title: "MORE STAYS,", desc: "MORE REWARDS!" }
        ];
        const benefitsStartX = getX(benefitsPos.x) - 100;
        let benefitsStartY = getY(benefitsPos.y) - 60;
        benefitsList.forEach((item) => {
          ctx.font = `bold ${Math.round(benefitsPos.fontSize * 1.6)}px sans-serif`;
          ctx.fillText(`🎁  ${item.title}`, benefitsStartX, benefitsStartY);
          ctx.font = `${Math.round(benefitsPos.fontSize * 1.2)}px sans-serif`;
          ctx.fillText(`    ${item.desc}`, benefitsStartX, benefitsStartY + 20);
          benefitsStartY += 45;
        });
        ctx.restore();

        // Draw Features list footer bar
        ctx.save();
        const featW = width * 0.92;
        const featH = 65;
        const featXCoord = getX(featuresPos.x) - featW / 2;
        const featYCoord = getY(featuresPos.y) - featH / 2;
        ctx.fillStyle = featuresPos.bgColor || '#4A2c11';
        ctx.beginPath();
        ctx.roundRect(featXCoord, featYCoord, featW, featH, 12);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = featuresPos.color || '#FFFFFF';
        ctx.font = `bold ${Math.round(featuresPos.fontSize * 1.4)}px sans-serif`;
        const featuresList = ["Premium Rooms", "Free Wi-Fi", "Family Friendly", "Prime Location", "Comfortable"];
        const segmentW = featW / featuresList.length;
        featuresList.forEach((feat, idx) => {
          const segX = featXCoord + segmentW * idx + segmentW / 2;
          ctx.fillText(feat, segX, getY(featuresPos.y));
        });
        ctx.restore();

        // 6. Draw branding
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.35;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(brandingText.toUpperCase(), width / 2, height - 30);
        ctx.restore();

        resolve(canvas);
      });
    });
  };

  const handleDownloadPNG = async () => {
    setExporting(true);
    try {
      const canvas = await drawPosterToCanvas();
      if (!canvas) return;

      const url = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.business.name.replace(/\s+/g, "_")}_QR_Poster.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("Failed to export PNG");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = async () => {
    setExporting(true);
    try {
      const canvas = await drawPosterToCanvas();
      if (!canvas) return;

      const url = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Poster</title>
            <style>
              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
              img { max-height: 100%; max-width: 100%; object-contain: fit; }
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error(e);
      alert("Failed to print poster");
    } finally {
      setExporting(false);
    }
  };

  const activeBranch = getActiveBranch();
  
  // Parse positions for HTML live preview card
  const logoPos = selectedTemplate?.logoPosition || { x: 50, y: 15, w: 20 };
  const qrPos = selectedTemplate?.qrPosition || { x: 50, y: 62, w: 32 };
  const namePos = selectedTemplate?.businessNamePosition || { x: 50, y: 40, fontSize: 26, color: "#0F172A" };
  const phonePos = selectedTemplate?.phonePosition || { x: 50, y: 86, fontSize: 14, color: "#475569" };
  const addressPos = selectedTemplate?.addressPosition || { x: 50, y: 91, fontSize: 12, color: "#64748B" };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4 md:py-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary animate-pulse" />
            QR Poster Designer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Pick a layout, select a store branch, and download your printable counter checkout QR poster instantly.
          </p>
        </div>

        {/* Branch Selector Dropdown */}
        {data?.branches?.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Outlet:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            >
              {data.branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Live Preview & Export CTA buttons (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="h-4.5 w-4.5 text-primary" />
              Live Interactive Preview
            </h2>

            {selectedTemplate ? (
              <div 
                className="relative aspect-[1/1.4] w-full max-w-[420px] mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col items-center p-4 transition-all duration-300"
                style={{ 
                  background: selectedTemplate.backgroundImage.startsWith('/uploads')
                    ? `url(${getImageUrl(selectedTemplate.backgroundImage)}) center/cover no-repeat`
                    : selectedTemplate.backgroundImage
                }}
              >
                {/* Logo overlay */}
                <div 
                  className="absolute flex items-center justify-center bg-white rounded-2xl shadow-md border border-slate-50/50 overflow-hidden"
                  style={{
                    left: `${logoPos.x}%`,
                    top: `${logoPos.y}%`,
                    width: `${logoPos.w}%`,
                    height: `${logoPos.w}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {data.business?.logoUrl ? (
                    <img src={getImageUrl(data.business.logoUrl)} alt="Logo" className="w-[82%] h-[82%] object-contain" />
                  ) : (
                    <div className="w-[82%] h-[82%] rounded-xl bg-slate-50 border border-dashed border-slate-250 flex items-center justify-center">
                      <ImageIcon size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Business Name overlay */}
                <div 
                  className="absolute text-center leading-tight w-[90%] font-black tracking-tight"
                  style={{
                    left: `${namePos.x}%`,
                    top: `${namePos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${namePos.fontSize * 0.75}px`,
                    color: namePos.color || '#0F172A',
                  }}
                >
                  {data.business?.name || "Business Name"}
                </div>

                {/* QR Code overlay */}
                <div 
                  className="absolute bg-white p-3 rounded-[24px] shadow-lg border border-slate-50/50 flex items-center justify-center"
                  style={{
                    left: `${qrPos.x}%`,
                    top: `${qrPos.y}%`,
                    width: `${qrPos.w}%`,
                    height: `${qrPos.w}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {activeBranch?.qrImage ? (
                    <img src={activeBranch.qrImage} alt="Branch QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold">
                      <Smartphone size={20} className="mb-1 text-slate-300" />
                      QR CODE
                    </div>
                  )}
                </div>

                {/* Phone overlay */}
                {data.business?.phone && (
                  <div 
                    className="absolute text-center font-bold tracking-tight text-xs leading-none"
                    style={{
                      left: `${phonePos.x}%`,
                      top: `${phonePos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${phonePos.fontSize * 0.8}px`,
                      color: phonePos.color || '#475569',
                    }}
                  >
                    📞 {data.business.phone}
                  </div>
                )}

                {/* Address overlay */}
                {data.business?.address && (
                  <div 
                    className="absolute text-center text-[10px] leading-none w-[90%] truncate opacity-85"
                    style={{
                      left: `${addressPos.x}%`,
                      top: `${addressPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${addressPos.fontSize * 0.8}px`,
                      color: addressPos.color || '#64748B',
                    }}
                  >
                    📍 {data.business.address}
                  </div>
                )}

                <div className="absolute bottom-1.5 right-3 text-[7.5px] opacity-25 font-black tracking-widest text-[#000]">
                  POWERED BY LOGISAAR
                </div>
              </div>
            ) : (
              <div className="aspect-[1/1.4] w-full max-w-[420px] mx-auto rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-slate-400">
                <ImageIcon size={32} className="text-slate-300 mb-2" />
                <p className="text-xs font-bold">No template chosen</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 max-w-[420px] mx-auto pt-2">
              <Button 
                onClick={handleDownloadPNG} 
                disabled={exporting || !selectedTemplate}
                className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold text-xs h-11 rounded-2xl shadow-md"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Download className="h-4 w-4 mr-1.5" />}
                Download PNG
              </Button>
              <Button 
                onClick={handlePrint} 
                disabled={exporting || !selectedTemplate}
                variant="outline" 
                className="flex-1 border-slate-200 hover:bg-slate-50 font-bold text-xs h-11 rounded-2xl shadow-sm"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print Poster
              </Button>
            </div>

            {/* Info Tip */}
            <div className="max-w-[420px] mx-auto bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex gap-2">
              <Info className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Whenever you change your Business Logo, Name, Address, or Phone in Settings, your QR Poster updates instantly.
              </p>
            </div>
          </div>

          {/* Right panel: Templates grid (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="h-4.5 w-4.5 text-primary" />
                Select A Poster Layout Design
              </h2>
              <span className="text-[10px] font-bold bg-orange-50 border border-orange-100 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Category: {data?.business?.category || "Café"}
              </span>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm">
                <QrCode className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No layout designs registered for your category yet.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Please contact administration to request custom poster designs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {templates.map((tpl) => {
                  const isCurrent = selectedTemplate?.id === tpl.id;
                  return (
                    <Card 
                      key={tpl.id} 
                      className={`rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-sm relative group ${
                        isCurrent 
                          ? 'border-primary ring-1 ring-primary' 
                          : 'border-slate-200 hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectTemplate(tpl)}
                    >
                      {/* Active Select Indicator Badge */}
                      {isCurrent && (
                        <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full z-10 shadow-sm">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                      )}

                      <CardContent className="p-3 space-y-3">
                        {/* Mini preview card */}
                        <div 
                          className="aspect-[1/1.4] w-full rounded-xl overflow-hidden flex items-center justify-center shadow-sm"
                          style={{ background: tpl.backgroundImage }}
                        >
                          {/* Mini logo placeholder */}
                          <div className="w-6 h-6 rounded bg-white shadow-sm border border-slate-50 opacity-45 flex items-center justify-center text-[7px] font-black text-slate-600">
                            LOGO
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] font-bold text-slate-800 truncate max-w-[80px]">{tpl.name}</p>
                          <Button 
                            size="sm" 
                            className={`h-6 text-[9px] px-2 rounded-lg font-bold ${
                              isCurrent 
                                ? 'bg-primary text-white hover:bg-primary/95' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {savingId === tpl.id ? 'Saving…' : (isCurrent ? 'Selected' : 'Select')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden high-res canvas for download assembly */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

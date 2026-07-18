import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Loader2, 
  Sparkles, 
  Check, 
  X,
  Smartphone,
  CheckCircle,
  FileImage,
  QrCode,
  Download
} from 'lucide-react';
import { api, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORIES = [
  "Restaurant",
  "Café",
  "Salon",
  "Gym",
  "Boutique",
  "Grocery",
  "Retail Store",
  "Hotel",
  "Spa",
  "Clinic",
  "Other"
];

// Helper to render poster preview directly on HTML/Canvas
function PosterCanvasPreview({ 
  template, 
  name = "My Business", 
  logo = "/new.png", 
  qr = "", 
  phone = "+91 99370 XXXXX", 
  address = "123 Main Street",
  tagline = "Comfort. Convenience. Hospitality.",
  banner = "Scan this QR code with your phone camera to check-in and earn stamps!",
  features = ["Premium AC Rooms", "Free Wi-Fi", "Family Friendly", "Prime Location", "Clean & Comfortable"],
  benefits = [
    { title: "EARN POINTS", desc: "Every time you visit" },
    { title: "EXCLUSIVE", desc: "Member Benefits" },
    { title: "SPECIAL OFFERS", desc: "Just for you" },
    { title: "MORE STAYS,", desc: "MORE REWARDS!" }
  ]
}) {
  const bgStyle = template.backgroundImage || "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)";
  const bgStyleEvaluated = bgStyle.startsWith('/uploads') ? `url(${getImageUrl(bgStyle)}) center/cover no-repeat` : bgStyle;
  
  // Parse positions
  const logoPos = typeof template.logoPosition === 'string' ? JSON.parse(template.logoPosition) : (template.logoPosition || { x: 50, y: 15, w: 20, h: 20 });
  const qrPos = typeof template.qrPosition === 'string' ? JSON.parse(template.qrPosition) : (template.qrPosition || { x: 50, y: 62, w: 32, h: 32 });
  const namePos = typeof template.businessNamePosition === 'string' ? JSON.parse(template.businessNamePosition) : (template.businessNamePosition || { x: 50, y: 40, fontSize: 24, color: "#0F172A", fontWeight: "bold" });
  const phonePos = typeof template.phonePosition === 'string' ? JSON.parse(template.phonePosition) : (template.phonePosition || { x: 50, y: 86, fontSize: 14, color: "#475569" });
  const addressPos = typeof template.addressPosition === 'string' ? JSON.parse(template.addressPosition) : (template.addressPosition || { x: 50, y: 91, fontSize: 12, color: "#64748B" });
  const taglinePos = typeof template.taglinePosition === 'string' ? JSON.parse(template.taglinePosition) : (template.taglinePosition || { x: 50, y: 28, fontSize: 13, color: "#6F4E37" });
  const bannerPos = typeof template.bannerPosition === 'string' ? JSON.parse(template.bannerPosition) : (template.bannerPosition || { x: 50, y: 46, fontSize: 11, color: "#FFFFFF", bgColor: "#7B3F00" });
  const featuresPos = typeof template.featuresPosition === 'string' ? JSON.parse(template.featuresPosition) : (template.featuresPosition || { x: 50, y: 95, fontSize: 10, color: "#FFFFFF", bgColor: "#4A2c11" });
  const benefitsPos = typeof template.benefitsPosition === 'string' ? JSON.parse(template.benefitsPosition) : (template.benefitsPosition || { x: 82, y: 72, fontSize: 9, color: "#3E2723" });
  const brandingText = template.brandingText || "Powered by Logisaar Technologies Pvt Ltd";

  return (
    <div 
      className="relative aspect-[1/1.4] w-full rounded-2xl overflow-hidden shadow-md flex flex-col items-center justify-between p-4 select-none border border-slate-200"
      style={{ background: bgStyleEvaluated }}
    >
      {/* Business Logo */}
      <div 
        className="absolute flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        style={{
          left: `${logoPos.x}%`,
          top: `${logoPos.y}%`,
          width: `${logoPos.w}%`,
          height: `${logoPos.w}%`, // Keep square aspect
          transform: 'translate(-50%, -50%)'
        }}
      >
        <img src={logo || "/new.png"} alt="Logo" className="w-[80%] h-[80%] object-contain" />
      </div>

      {/* Business Name */}
      <div 
        className="absolute text-center leading-tight w-[90%]"
        style={{
          left: `${namePos.x}%`,
          top: `${namePos.y}%`,
          transform: 'translate(-50%, -50%)',
          fontSize: `${namePos.fontSize * 0.75}px`,
          color: namePos.color || '#0F172A',
          fontWeight: namePos.fontWeight || 'bold'
        }}
      >
        {name}
      </div>

      {/* Tagline */}
      {tagline && (
        <div 
          className="absolute text-center italic tracking-wide font-medium w-[90%]"
          style={{
            left: `${taglinePos.x}%`,
            top: `${taglinePos.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${(taglinePos.fontSize || 13) * 0.75}px`,
            color: taglinePos.color || '#6F4E37'
          }}
        >
          ✨ {tagline} ✨
        </div>
      )}

      {/* Main Instructions Banner */}
      {banner && (
        <div 
          className="absolute text-center px-3 py-1.5 rounded-xl font-bold w-[80%] leading-tight text-white flex items-center justify-center shadow-sm"
          style={{
            left: `${bannerPos.x}%`,
            top: `${bannerPos.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${(bannerPos.fontSize || 11) * 0.75}px`,
            color: bannerPos.color || '#FFFFFF',
            backgroundColor: bannerPos.bgColor || '#7B3F00'
          }}
        >
          {banner}
        </div>
      )}

      {/* QR Code */}
      <div 
        className="absolute bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center"
        style={{
          left: `${qrPos.x}%`,
          top: `${qrPos.y}%`,
          width: `${qrPos.w}%`,
          height: `${qrPos.w}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {qr ? (
          <img src={qr} alt="QR Code" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold">
            <Smartphone size={20} className="mb-1 text-slate-300" />
            QR CODE
          </div>
        )}
      </div>

      {/* Loyalty Benefits Sidebar List */}
      {benefits && benefits.length > 0 && (
        <div 
          className="absolute flex flex-col gap-2 align-start text-left max-w-[45%]"
          style={{
            left: `${benefitsPos.x}%`,
            top: `${benefitsPos.y}%`,
            transform: 'translate(-50%, -50%)',
            color: benefitsPos.color || '#3E2723'
          }}
        >
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div className="h-4 w-4 bg-amber-700 text-white font-black text-[9px] rounded-full flex items-center justify-center shrink-0">🎁</div>
              <div className="leading-tight">
                <span className="block font-black uppercase text-[7.5px]">{b.title}</span>
                <span className="block text-[6.5px] opacity-75">{b.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Features Horizontal Grid List */}
      {features && features.length > 0 && (
        <div 
          className="absolute w-[92%] px-2.5 py-1.5 rounded-xl text-white flex items-center justify-between gap-1 shadow-inner"
          style={{
            left: `${featuresPos.x}%`,
            top: `${featuresPos.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: featuresPos.bgColor || '#4A2c11',
            color: featuresPos.color || '#FFFFFF'
          }}
        >
          {features.map((f, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center flex-1 border-r last:border-0 border-white/20">
              <span className="text-[6.5px] font-black uppercase tracking-tight text-center">{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Phone Number */}
      <div 
        className="absolute text-center leading-none"
        style={{
          left: `${phonePos.x}%`,
          top: `${phonePos.y}%`,
          transform: 'translate(-50%, -50%)',
          fontSize: `${phonePos.fontSize * 0.8}px`,
          color: phonePos.color || '#475569',
          fontWeight: 'semibold'
        }}
      >
        📞 {phone}
      </div>

      {/* Address */}
      <div 
        className="absolute text-center leading-none w-[90%] truncate"
        style={{
          left: `${addressPos.x}%`,
          top: `${addressPos.y}%`,
          transform: 'translate(-50%, -50%)',
          fontSize: `${addressPos.fontSize * 0.8}px`,
          color: addressPos.color || '#64748B'
        }}
      >
        📍 {address}
      </div>
      
      {/* Branding stamp */}
      <div className="absolute bottom-1 right-2 text-[8px] opacity-35 font-bold tracking-widest text-[#000]">
        {brandingText}
      </div>
    </div>
  );
}

export default function SuperAdminPosterManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Café');
  const [backgroundImage, setBackgroundImage] = useState('linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)');
  const [logoX, setLogoX] = useState(50);
  const [logoY, setLogoY] = useState(15);
  const [logoW, setLogoW] = useState(20);
  const [qrX, setQrX] = useState(50);
  const [qrY, setQrY] = useState(62);
  const [qrW, setQrW] = useState(32);
  const [nameX, setNameX] = useState(50);
  const [nameY, setNameY] = useState(40);
  const [nameSize, setNameSize] = useState(26);
  const [nameColor, setNameColor] = useState('#0F172A');
  const [phoneX, setPhoneX] = useState(50);
  const [phoneY, setPhoneY] = useState(86);
  const [phoneSize, setPhoneSize] = useState(14);
  const [phoneColor, setPhoneColor] = useState('#475569');
  const [addressX, setAddressX] = useState(50);
  const [addressY, setAddressY] = useState(91);
  const [addressSize, setAddressSize] = useState(12);
  const [addressColor, setAddressColor] = useState('#64748B');
  const [status, setStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [testingName, setTestingName] = useState('My Business');
  const [testingPhone, setTestingPhone] = useState('+91 99370 XXXXX');
  const [testingAddress, setTestingAddress] = useState('123 Main Street');

  // Tagline coordinates state
  const [taglineX, setTaglineX] = useState(50);
  const [taglineY, setTaglineY] = useState(28);
  const [taglineSize, setTaglineSize] = useState(13);
  const [taglineColor, setTaglineColor] = useState('#6F4E37');

  // Banner coordinates state
  const [bannerX, setBannerX] = useState(50);
  const [bannerY, setBannerY] = useState(46);
  const [bannerSize, setBannerSize] = useState(11);
  const [bannerColor, setBannerColor] = useState('#FFFFFF');
  const [bannerBgColor, setBannerBgColor] = useState('#7B3F00');

  // Features coordinates state
  const [featuresX, setFeaturesX] = useState(50);
  const [featuresY, setFeaturesY] = useState(95);
  const [featuresSize, setFeaturesSize] = useState(10);
  const [featuresColor, setFeaturesColor] = useState('#FFFFFF');
  const [featuresBgColor, setFeaturesBgColor] = useState('#4A2c11');

  // Benefits coordinates state
  const [benefitsX, setBenefitsX] = useState(82);
  const [benefitsY, setBenefitsY] = useState(72);
  const [benefitsSize, setBenefitsSize] = useState(9);
  const [benefitsColor, setBenefitsColor] = useState('#3E2723');

  // Footer Brand Name state
  const [brandingText, setBrandingText] = useState('Powered by Logisaar Technologies Pvt Ltd');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posters/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('Café');
    setBackgroundImage('linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)');
    setUploadedFile(null);
    setTestingName('My Business');
    setTestingPhone('+91 99370 XXXXX');
    setTestingAddress('123 Main Street');
    setLogoX(50); setLogoY(15); setLogoW(20);
    setQrX(50); setQrY(62); setQrW(32);
    setNameX(50); setNameY(40); setNameSize(26); setNameColor('#0F172A');
    setPhoneX(50); setPhoneY(86); setPhoneSize(14); setPhoneColor('#475569');
    setAddressX(50); setAddressY(91); setAddressSize(12); setAddressColor('#64748B');
    
    // Tagline default values
    setTaglineX(50); setTaglineY(28); setTaglineSize(13); setTaglineColor('#6F4E37');
    
    // Banner default values
    setBannerX(50); setBannerY(46); setBannerSize(11); setBannerColor('#FFFFFF'); setBannerBgColor('#7B3F00');
    
    // Features default values
    setFeaturesX(50); setFeaturesY(95); setFeaturesSize(10); setFeaturesColor('#FFFFFF'); setFeaturesBgColor('#4A2c11');
    
    // Benefits default values
    setBenefitsX(82); setBenefitsY(72); setBenefitsSize(9); setBenefitsColor('#3E2723');
    
    // Branding default
    setBrandingText('Powered by Logisaar Technologies Pvt Ltd');

    setStatus(true);
    setShowModal(true);
  };

  const openEditModal = (tpl) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setCategory(tpl.category);
    setBackgroundImage(tpl.backgroundImage);
    setUploadedFile(null);
    setTestingName('My Business');
    setTestingPhone('+91 99370 XXXXX');
    setTestingAddress('123 Main Street');
    
    const logoPos = tpl.logoPosition || {};
    setLogoX(logoPos.x ?? 50); setLogoY(logoPos.y ?? 15); setLogoW(logoPos.w ?? 20);
    
    const qrPos = tpl.qrPosition || {};
    setQrX(qrPos.x ?? 50); setQrY(qrPos.y ?? 62); setQrW(qrPos.w ?? 32);

    const namePos = tpl.businessNamePosition || {};
    setNameX(namePos.x ?? 50); setNameY(namePos.y ?? 40); setNameSize(namePos.fontSize ?? 26); setNameColor(namePos.color ?? '#0F172A');

    const phonePos = tpl.phonePosition || {};
    setPhoneX(phonePos.x ?? 50); setPhoneY(phonePos.y ?? 86); setPhoneSize(phonePos.fontSize ?? 14); setPhoneColor(phonePos.color ?? '#475569');

    const addressPos = tpl.addressPosition || {};
    setAddressX(addressPos.x ?? 50); setAddressY(addressPos.y ?? 91); setAddressSize(addressPos.fontSize ?? 12); setAddressColor(addressPos.color ?? '#64748B');

    // Parse tagline
    const taglinePos = tpl.taglinePosition || {};
    setTaglineX(taglinePos.x ?? 50); setTaglineY(taglinePos.y ?? 28); setTaglineSize(taglinePos.fontSize ?? 13); setTaglineColor(taglinePos.color ?? '#6F4E37');

    // Parse banner
    const bannerPos = tpl.bannerPosition || {};
    setBannerX(bannerPos.x ?? 50); setBannerY(bannerPos.y ?? 46); setBannerSize(bannerPos.fontSize ?? 11); setBannerColor(bannerPos.color ?? '#FFFFFF'); setBannerBgColor(bannerPos.bgColor ?? '#7B3F00');

    // Parse features
    const featuresPos = tpl.featuresPosition || {};
    setFeaturesX(featuresPos.x ?? 50); setFeaturesY(featuresPos.y ?? 95); setFeaturesSize(featuresPos.fontSize ?? 10); setFeaturesColor(featuresPos.color ?? '#FFFFFF'); setFeaturesBgColor(featuresPos.bgColor ?? '#4A2c11');

    // Parse benefits
    const benefitsPos = tpl.benefitsPosition || {};
    setBenefitsX(benefitsPos.x ?? 82); setBenefitsY(benefitsPos.y ?? 72); setBenefitsSize(benefitsPos.fontSize ?? 9); setBenefitsColor(benefitsPos.color ?? '#3E2723');

    // Branding text
    setBrandingText(tpl.brandingText || 'Powered by Logisaar Technologies Pvt Ltd');

    setStatus(tpl.status);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('backgroundImage', backgroundImage);
    formData.append('logoPosition', JSON.stringify({ x: Number(logoX), y: Number(logoY), w: Number(logoW), h: Number(logoW) }));
    formData.append('qrPosition', JSON.stringify({ x: Number(qrX), y: Number(qrY), w: Number(qrW), h: Number(qrW) }));
    formData.append('businessNamePosition', JSON.stringify({ x: Number(nameX), y: Number(nameY), fontSize: Number(nameSize), color: nameColor, fontWeight: 'bold' }));
    formData.append('phonePosition', JSON.stringify({ x: Number(phoneX), y: Number(phoneY), fontSize: Number(phoneSize), color: phoneColor }));
    formData.append('addressPosition', JSON.stringify({ x: Number(addressX), y: Number(addressY), fontSize: Number(addressSize), color: addressColor }));
    
    // Append tagline, banner, features, benefits and branding
    formData.append('taglinePosition', JSON.stringify({ x: Number(taglineX), y: Number(taglineY), fontSize: Number(taglineSize), color: taglineColor }));
    formData.append('bannerPosition', JSON.stringify({ x: Number(bannerX), y: Number(bannerY), fontSize: Number(bannerSize), color: bannerColor, bgColor: bannerBgColor }));
    formData.append('featuresPosition', JSON.stringify({ x: Number(featuresX), y: Number(featuresY), fontSize: Number(featuresSize), color: featuresColor, bgColor: featuresBgColor }));
    formData.append('benefitsPosition', JSON.stringify({ x: Number(benefitsX), y: Number(benefitsY), fontSize: Number(benefitsSize), color: benefitsColor }));
    formData.append('brandingText', brandingText);

    formData.append('status', String(status));

    if (uploadedFile) {
      formData.append('backgroundImageFile', uploadedFile);
    }

    try {
      if (editingTemplate) {
        await api.put(`/posters/templates/${editingTemplate.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/posters/templates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      alert(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await api.delete(`/posters/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      alert("Failed to delete template");
    }
  };

  const handleToggleStatus = async (tpl) => {
    try {
      await api.put(`/posters/templates/${tpl.id}`, {
        ...tpl,
        status: !tpl.status
      });
      fetchTemplates();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const previewObject = {
    backgroundImage,
    logoPosition: { x: Number(logoX), y: Number(logoY), w: Number(logoW) },
    qrPosition: { x: Number(qrX), y: Number(qrY), w: Number(qrW) },
    businessNamePosition: { x: Number(nameX), y: Number(nameY), fontSize: Number(nameSize), color: nameColor },
    phonePosition: { x: Number(phoneX), y: Number(phoneY), fontSize: Number(phoneSize), color: phoneColor },
    addressPosition: { x: Number(addressX), y: Number(addressY), fontSize: Number(addressSize), color: addressColor },
    taglinePosition: { x: Number(taglineX), y: Number(taglineY), fontSize: Number(taglineSize), color: taglineColor },
    bannerPosition: { x: Number(bannerX), y: Number(bannerY), fontSize: Number(bannerSize), color: bannerColor, bgColor: bannerBgColor },
    featuresPosition: { x: Number(featuresX), y: Number(featuresY), fontSize: Number(featuresSize), color: featuresColor, bgColor: featuresBgColor },
    benefitsPosition: { x: Number(benefitsX), y: Number(benefitsY), fontSize: Number(benefitsSize), color: benefitsColor },
    brandingText: brandingText
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Poster Template Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage vector-gradient QR checkout stand design templates across all business categories
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-full">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <FileImage className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">No poster templates found</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first QR checkout stand poster design template above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex flex-col justify-between group">
              <div className="space-y-4">
                <PosterCanvasPreview template={tpl} />
                <div className="flex items-start justify-between mt-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{tpl.name}</h3>
                    <span className="inline-block text-[10px] font-black text-primary px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-100 uppercase tracking-wide mt-1">
                      {tpl.category}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(tpl)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                      tpl.status 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {tpl.status ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3.5 mt-4">
                <Button 
                  onClick={() => openEditModal(tpl)} 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-[10px] h-8 font-bold border-slate-200 rounded-xl px-2"
                >
                  <Edit2 className="h-3 w-3 mr-0.5" />
                  Edit
                </Button>
                <Button 
                  onClick={async () => {
                    // Create temporary canvas to draw and download the high-res poster template
                    const canvas = document.createElement('canvas');
                    const width = 1200;
                    const height = 1680;
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, width, height);

                    const bgStyle = tpl.backgroundImage || "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)";
                    const isImgBg = bgStyle.startsWith('/uploads');

                    const getX = (val) => (val / 100) * width;
                    const getY = (val) => (val / 100) * height;

                    const logoPos = typeof tpl.logoPosition === 'string' ? JSON.parse(tpl.logoPosition) : (tpl.logoPosition || { x: 50, y: 15, w: 20 });
                    const qrPos = typeof tpl.qrPosition === 'string' ? JSON.parse(tpl.qrPosition) : (tpl.qrPosition || { x: 50, y: 62, w: 32 });
                    const namePos = typeof tpl.businessNamePosition === 'string' ? JSON.parse(tpl.businessNamePosition) : (tpl.businessNamePosition || { x: 50, y: 40, fontSize: 26, color: "#0F172A" });
                    const phonePos = typeof tpl.phonePosition === 'string' ? JSON.parse(tpl.phonePosition) : (tpl.phonePosition || { x: 50, y: 86, fontSize: 14, color: "#475569" });
                    const addressPos = typeof tpl.addressPosition === 'string' ? JSON.parse(tpl.addressPosition) : (tpl.addressPosition || { x: 50, y: 91, fontSize: 12, color: "#64748B" });
                    const taglinePos = typeof tpl.taglinePosition === 'string' ? JSON.parse(tpl.taglinePosition) : (tpl.taglinePosition || { x: 50, y: 28, fontSize: 13, color: "#6F4E37" });
                    const bannerPos = typeof tpl.bannerPosition === 'string' ? JSON.parse(tpl.bannerPosition) : (tpl.bannerPosition || { x: 50, y: 46, fontSize: 11, color: "#FFFFFF", bgColor: "#7B3F00" });
                    const featuresPos = typeof tpl.featuresPosition === 'string' ? JSON.parse(tpl.featuresPosition) : (tpl.featuresPosition || { x: 50, y: 95, fontSize: 10, color: "#FFFFFF", bgColor: "#4A2c11" });
                    const benefitsPos = typeof tpl.benefitsPosition === 'string' ? JSON.parse(tpl.benefitsPosition) : (tpl.benefitsPosition || { x: 82, y: 72, fontSize: 9, color: "#3E2723" });
                    const brandingText = tpl.brandingText || "Powered by Logisaar Technologies Pvt Ltd";

                    const imagesToLoad = [];
                    let bgImg = null;
                    if (isImgBg) {
                      bgImg = new Image();
                      bgImg.crossOrigin = "anonymous";
                      bgImg.src = getImageUrl(bgStyle);
                      imagesToLoad.push(new Promise((res) => { bgImg.onload = () => res(true); bgImg.onerror = () => res(false); }));
                    }

                    // Load sample logo and QR Code images
                    let logoImg = new Image();
                    logoImg.crossOrigin = "anonymous";
                    logoImg.src = "/new.png";
                    imagesToLoad.push(new Promise((res) => { logoImg.onload = () => res(true); logoImg.onerror = () => res(false); }));

                    Promise.all(imagesToLoad).then(() => {
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

                      // Draw logo
                      if (logoImg.complete && logoImg.naturalWidth > 0) {
                        const size = (logoPos.w / 100) * width;
                        const x = getX(logoPos.x) - size / 2;
                        const y = getY(logoPos.y) - size / 2;
                        ctx.save();
                        ctx.shadowColor = 'rgba(0,0,0,0.06)';
                        ctx.shadowBlur = 15;
                        ctx.shadowOffsetY = 5;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.roundRect(x, y, size, size, 20);
                        ctx.fill();
                        ctx.restore();

                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(x + 10, y + 10, size - 20, size - 20, 15);
                        ctx.clip();
                        ctx.drawImage(logoImg, x + 10, y + 10, size - 20, size - 20);
                        ctx.restore();
                      }

                      // Draw Business Name
                      ctx.save();
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = namePos.color || '#0F172A';
                      ctx.font = `bold ${Math.round(namePos.fontSize * 1.5)}px sans-serif`;
                      ctx.fillText("My Business", getX(namePos.x), getY(namePos.y));
                      ctx.restore();

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

                      // Draw QR Card placeholder
                      const qrSize = (qrPos.w / 100) * width;
                      const qrXCoord = getX(qrPos.x) - qrSize / 2;
                      const qrYCoord = getY(qrPos.y) - qrSize / 2;
                      ctx.save();
                      ctx.shadowColor = 'rgba(0,0,0,0.08)';
                      ctx.shadowBlur = 20;
                      ctx.shadowOffsetY = 8;
                      ctx.fillStyle = '#FFFFFF';
                      ctx.beginPath();
                      ctx.roundRect(qrXCoord, qrYCoord, qrSize, qrSize, 24);
                      ctx.fill();
                      ctx.restore();

                      // Draw Benefits Sidebar
                      ctx.save();
                      ctx.textAlign = 'left';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = benefitsPos.color || '#3E2723';
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

                      // Draw Features Grid
                      const featW = width * 0.92;
                      const featH = 65;
                      const featXCoord = getX(featuresPos.x) - featW / 2;
                      const featYCoord = getY(featuresPos.y) - featH / 2;
                      ctx.save();
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

                      // Draw Phone & Address
                      ctx.save();
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = phonePos.color || '#475569';
                      ctx.font = `600 ${Math.round(phonePos.fontSize * 1.5)}px sans-serif`;
                      ctx.fillText(`📞  ${phone}`, getX(phonePos.x), getY(phonePos.y));
                      ctx.restore();

                      ctx.save();
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = addressPos.color || '#64748B';
                      ctx.font = `${Math.round(addressPos.fontSize * 1.5)}px sans-serif`;
                      ctx.fillText(`📍  ${address}`, getX(addressPos.x), getY(addressPos.y));
                      ctx.restore();

                      // Draw branding stamp
                      ctx.save();
                      ctx.textAlign = 'center';
                      ctx.fillStyle = '#000000';
                      ctx.globalAlpha = 0.35;
                      ctx.font = 'bold 16px sans-serif';
                      ctx.fillText(brandingText.toUpperCase(), width / 2, height - 30);
                      ctx.restore();

                      // Export Canvas to PNG
                      const url = canvas.toDataURL("image/png");
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${tpl.name.replace(/\s+/g, "_")}_Sample_Poster.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    });
                  }}
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-[10px] h-8 font-bold border-slate-200 rounded-xl px-2"
                >
                  <Download className="h-3 w-3 mr-0.5" />
                  QR Poster
                </Button>
                <Button 
                  onClick={() => handleDelete(tpl.id)} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col md:flex-row gap-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left side: Live Interactive Preview */}
            <div className="md:w-1/2 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Eye className="h-4.5 w-4.5 text-primary" />
                Live Design Canvas
              </h3>
              <PosterCanvasPreview 
                template={previewObject} 
                name={testingName || "My Business"} 
                phone={testingPhone || "+91 99370 XXXXX"} 
                address={testingAddress || "123 Main Street"}
              />
            </div>

            {/* Right side: Parameter adjustments */}
            <div className="md:w-1/2 flex flex-col justify-between">
              <form onSubmit={handleSave} className="space-y-4">
                <h3 className="text-base font-black text-slate-800">
                  {editingTemplate ? 'Modify Template' : 'Create Poster Design'}
                </h3>

                {/* Text Data Testing Inputs */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2.5">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Canvas Testing Info (Live preview text)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500 font-semibold">Business Name</Label>
                      <Input 
                        value={testingName} 
                        onChange={(e) => setTestingName(e.target.value)} 
                        placeholder="e.g. Cafe Brews" 
                        className="text-[11px] h-8 bg-white" 
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500 font-semibold">Phone Number</Label>
                      <Input 
                        value={testingPhone} 
                        onChange={(e) => setTestingPhone(e.target.value)} 
                        placeholder="e.g. 9876543210" 
                        className="text-[11px] h-8 bg-white" 
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500 font-semibold">Address text</Label>
                      <Input 
                        value={testingAddress} 
                        onChange={(e) => setTestingAddress(e.target.value)} 
                        placeholder="e.g. Janpath, BBSR" 
                        className="text-[11px] h-8 bg-white" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-500">Template Name</Label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. Minimalist Dark" 
                      required 
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-500">Category Mapping</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-500">Upload Background Image Design</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        // set local URL for immediate preview
                        setBackgroundImage(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs bg-slate-50 border-slate-200"
                    required={!editingTemplate}
                  />
                  {editingTemplate && !uploadedFile && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Leave empty to retain existing background template design.
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Logo coordinates (%)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={logoX} onChange={(e) => setLogoX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={logoY} onChange={(e) => setLogoY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Width Size</Label>
                      <Input type="number" value={logoW} onChange={(e) => setLogoW(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">QR Code coordinates (%)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={qrX} onChange={(e) => setQrX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={qrY} onChange={(e) => setQrY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Width Size</Label>
                      <Input type="number" value={qrW} onChange={(e) => setQrW(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Business Name coordinates (%)</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={nameX} onChange={(e) => setNameX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={nameY} onChange={(e) => setNameY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Font size</Label>
                      <Input type="number" value={nameSize} onChange={(e) => setNameSize(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Color Hex</Label>
                      <Input value={nameColor} onChange={(e) => setNameColor(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Tagline coordinates (%)</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={taglineX} onChange={(e) => setTaglineX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={taglineY} onChange={(e) => setTaglineY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Font size</Label>
                      <Input type="number" value={taglineSize} onChange={(e) => setTaglineSize(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Color Hex</Label>
                      <Input value={taglineColor} onChange={(e) => setTaglineColor(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Banner coordinates (%)</p>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={bannerX} onChange={(e) => setBannerX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={bannerY} onChange={(e) => setBannerY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Font size</Label>
                      <Input type="number" value={bannerSize} onChange={(e) => setBannerSize(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Color Hex</Label>
                      <Input value={bannerColor} onChange={(e) => setBannerColor(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Bg Color</Label>
                      <Input value={bannerBgColor} onChange={(e) => setBannerBgColor(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Features grid coordinates (%)</p>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={featuresX} onChange={(e) => setFeaturesX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={featuresY} onChange={(e) => setFeaturesY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Font size</Label>
                      <Input type="number" value={featuresSize} onChange={(e) => setFeaturesSize(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Color Hex</Label>
                      <Input value={featuresColor} onChange={(e) => setFeaturesColor(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Bg Color</Label>
                      <Input value={featuresBgColor} onChange={(e) => setFeaturesBgColor(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Benefits sidebar coordinates (%)</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Position X</Label>
                      <Input type="number" value={benefitsX} onChange={(e) => setBenefitsX(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Position Y</Label>
                      <Input type="number" value={benefitsY} onChange={(e) => setBenefitsY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Font size</Label>
                      <Input type="number" value={benefitsSize} onChange={(e) => setBenefitsSize(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Color Hex</Label>
                      <Input value={benefitsColor} onChange={(e) => setBenefitsColor(e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Branding stamp footer text</p>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Branding Text</Label>
                      <Input value={brandingText} onChange={(e) => setBrandingText(e.target.value)} placeholder="e.g. Powered by Logisaar Technologies" className="text-xs h-8" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Footer options (%)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Phone Y</Label>
                      <Input type="number" value={phoneY} onChange={(e) => setPhoneY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Address Y</Label>
                      <Input type="number" value={addressY} onChange={(e) => setAddressY(e.target.value)} className="text-xs h-8" />
                    </div>
                    <div className="flex items-center pt-5">
                      <input 
                        type="checkbox" 
                        id="modal-status" 
                        checked={status} 
                        onChange={(e) => setStatus(e.target.checked)} 
                        className="h-4 w-4 text-primary border-slate-350 rounded focus:ring-primary"
                      />
                      <Label htmlFor="modal-status" className="text-xs font-semibold text-slate-600 ml-1.5 select-none">Active</Label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 font-bold text-xs h-10 border-slate-200 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold text-xs h-10 rounded-xl shadow-md"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Save Template
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

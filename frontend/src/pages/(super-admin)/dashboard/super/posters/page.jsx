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
  FileImage
} from 'lucide-react';
import { api } from '@/lib/api';
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
function PosterCanvasPreview({ template, name = "My Business", logo = "/new.png", qr = "", phone = "+91 99370 XXXXX", address = "123 Main Street" }) {
  const bgStyle = template.backgroundImage || "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)";
  
  // Parse positions
  const logoPos = typeof template.logoPosition === 'string' ? JSON.parse(template.logoPosition) : (template.logoPosition || { x: 50, y: 15, w: 20, h: 20 });
  const qrPos = typeof template.qrPosition === 'string' ? JSON.parse(template.qrPosition) : (template.qrPosition || { x: 50, y: 62, w: 32, h: 32 });
  const namePos = typeof template.businessNamePosition === 'string' ? JSON.parse(template.businessNamePosition) : (template.businessNamePosition || { x: 50, y: 40, fontSize: 24, color: "#0F172A", fontWeight: "bold" });
  const phonePos = typeof template.phonePosition === 'string' ? JSON.parse(template.phonePosition) : (template.phonePosition || { x: 50, y: 86, fontSize: 14, color: "#475569" });
  const addressPos = typeof template.addressPosition === 'string' ? JSON.parse(template.addressPosition) : (template.addressPosition || { x: 50, y: 91, fontSize: 12, color: "#64748B" });

  return (
    <div 
      className="relative aspect-[1/1.4] w-full rounded-2xl overflow-hidden shadow-md flex flex-col items-center justify-between p-4 select-none border border-slate-200"
      style={{ background: bgStyle }}
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
        POWERED BY LOGISAAR
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
    setLogoX(50); setLogoY(15); setLogoW(20);
    setQrX(50); setQrY(62); setQrW(32);
    setNameX(50); setNameY(40); setNameSize(26); setNameColor('#0F172A');
    setPhoneX(50); setPhoneY(86); setPhoneSize(14); setPhoneColor('#475569');
    setAddressX(50); setAddressY(91); setAddressSize(12); setAddressColor('#64748B');
    setStatus(true);
    setShowModal(true);
  };

  const openEditModal = (tpl) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setCategory(tpl.category);
    setBackgroundImage(tpl.backgroundImage);
    
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

    setStatus(tpl.status);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      category,
      backgroundImage,
      logoPosition: { x: Number(logoX), y: Number(logoY), w: Number(logoW), h: Number(logoW) },
      qrPosition: { x: Number(qrX), y: Number(qrY), w: Number(qrW), h: Number(qrW) },
      businessNamePosition: { x: Number(nameX), y: Number(nameY), fontSize: Number(nameSize), color: nameColor, fontWeight: 'bold' },
      phonePosition: { x: Number(phoneX), y: Number(phoneY), fontSize: Number(phoneSize), color: phoneColor },
      addressPosition: { x: Number(addressX), y: Number(addressY), fontSize: Number(addressSize), color: addressColor },
      status
    };

    try {
      if (editingTemplate) {
        await api.put(`/posters/templates/${editingTemplate.id}`, payload);
      } else {
        await api.post('/posters/templates', payload);
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
    addressPosition: { x: Number(addressX), y: Number(addressY), fontSize: Number(addressSize), color: addressColor }
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

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5 mt-4">
                <Button 
                  onClick={() => openEditModal(tpl)} 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-[11px] h-8 font-bold border-slate-200 rounded-xl"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(tpl.id)} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
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
              <PosterCanvasPreview template={previewObject} />
            </div>

            {/* Right side: Parameter adjustments */}
            <div className="md:w-1/2 flex flex-col justify-between">
              <form onSubmit={handleSave} className="space-y-4">
                <h3 className="text-base font-black text-slate-800">
                  {editingTemplate ? 'Modify Template' : 'Create Poster Design'}
                </h3>
                
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
                  <Label className="text-[11px] font-semibold text-slate-500">Background Gradient CSS / Color</Label>
                  <Input 
                    value={backgroundImage} 
                    onChange={(e) => setBackgroundImage(e.target.value)} 
                    placeholder="e.g. linear-gradient(135deg, #000, #333)" 
                    required 
                    className="text-xs bg-slate-50 border-slate-200"
                  />
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

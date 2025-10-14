"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Briefcase,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Edit2,
  X
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    professorType: "",
    bio: "",
  });

  // Profile form (for editing)
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    professorType: "",
    bio: "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const professorTypes = [
    "Langues",
    "Musique",
    "Sciences",
    "Mathématiques",
    "Informatique",
    "Arts",
    "Sport",
    "Soutien scolaire",
    "Autre",
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        const userData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          professorType: data.professorType || "",
          bio: data.bio || "",
        };
        setProfileData(userData);
        setProfileForm(userData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (section: string) => {
    setEditingSection(section);
    setMessage(null);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setProfileForm(profileData);
    setMessage(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData({
          firstName: updatedData.firstName || "",
          lastName: updatedData.lastName || "",
          email: updatedData.email || "",
          phone: updatedData.phone || "",
          address: updatedData.address || "",
          professorType: updatedData.professorType || "",
          bio: updatedData.bio || "",
        });
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setEditingSection(null);
        // Update session if email changed
        await update();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erreur lors de la mise à jour" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour du profil" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Mot de passe modifié avec succès" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setEditingSection(null);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erreur lors du changement de mot de passe" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du changement de mot de passe" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Paramètres</h1>
        <p className="text-lg text-muted-foreground">
          Gérez les paramètres de votre compte
        </p>
      </div>

      {/* Message */}
      {message && (
        <Card className={`border-l-4 ${message.type === "success" ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}>
          <CardContent className="flex items-center gap-3 p-4">
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={message.type === "success" ? "text-green-900" : "text-red-900"}>
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Personal Info Card */}
            <Card className="border-blue-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Informations personnelles</CardTitle>
                    <CardDescription>Vos informations de base</CardDescription>
                  </div>
                  {editingSection !== "personal" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing("personal")}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingSection === "personal" ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="12 rue de la République, 75001 Paris"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button type="submit" disabled={saving} className="gap-2">
                        {saving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Nom complet</p>
                        <p className="text-base text-gray-900 mt-1">
                          {profileData.firstName} {profileData.lastName}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-base text-gray-900 mt-1">
                          {profileData.email || <span className="text-gray-400">Non renseigné</span>}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Téléphone</p>
                        <p className="text-base text-gray-900 mt-1">
                          {profileData.phone || <span className="text-gray-400">Non renseigné</span>}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Adresse</p>
                        <p className="text-base text-gray-900 mt-1">
                          {profileData.address || <span className="text-gray-400">Non renseigné</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Info Card */}
            <Card className="border-blue-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Informations professionnelles</CardTitle>
                    <CardDescription>Votre profil professionnel</CardDescription>
                  </div>
                  {editingSection !== "professional" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing("professional")}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingSection === "professional" ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="professorType">Type de professeur</Label>
                      <div className="flex flex-wrap gap-2">
                        {professorTypes.map((type) => (
                          <Badge
                            key={type}
                            variant={profileForm.professorType === type ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              profileForm.professorType === type
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "hover:bg-blue-50"
                            }`}
                            onClick={() => setProfileForm({ ...profileForm, professorType: type })}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Parlez de votre expérience, vos qualifications, votre approche pédagogique..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Cette information sera visible par vos clients
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button type="submit" disabled={saving} className="gap-2">
                        {saving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Type de professeur</p>
                        <div className="mt-2">
                          {profileData.professorType ? (
                            <Badge className="bg-blue-600">{profileData.professorType}</Badge>
                          ) : (
                            <span className="text-gray-400">Non renseigné</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Biographie</p>
                        <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                          {profileData.bio || <span className="text-gray-400">Non renseigné</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-blue-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Sécurité</CardTitle>
                  <CardDescription>
                    Gérez la sécurité de votre compte
                  </CardDescription>
                </div>
                {editingSection !== "password" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing("password")}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier le mot de passe
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === "password" ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum 8 caractères
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2">
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Modification...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Modifier le mot de passe
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Mot de passe</p>
                      <p className="text-base text-gray-900 mt-1">••••••••</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dernière modification : il y a quelques jours
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

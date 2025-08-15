 //# API endpoint'lerini yöneten fonksiyonlar (request-response)
import { Request, Response } from "express";
import authService from "../services/authService";
import profileService from "../services/profileService";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}


export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    const result = await authService.login(identifier, password);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    return res.json({
      message: result.message,
      token: result.token,
      admin: result.admin
    });
  } catch (error) {
    console.error("Login controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    const result = await authService.changePassword(adminId, currentPassword, newPassword);

    if (!result.success) {
      const statusCode = result.message.includes("bulunamadı") ? 404 : 400;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error("Change password controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const validateToken = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Geçersiz token" });
    }

    const result = await authService.validateToken(adminId);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    return res.json({ 
      message: result.message, 
      admin: result.admin
    });
  } catch (error) {
    console.error("Validate token controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    if (!result.success) {
      const statusCode = result.message.includes("gereklidir") ? 400 : 500;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error("Forgot password controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error("Reset password controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const result = await authService.validateResetToken(token);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.json({ 
      message: result.message, 
      email: result.data?.email 
    });
  } catch (error) {
    console.error("Validate reset token controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    const result = await profileService.getAdminProfile(adminId);

    if (!result.success) {
      const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.json({
      message: result.message,
      admin: result.data
    });
  } catch (error) {
    console.error("Get admin profile controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { username, email } = req.body;

    if (!adminId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    const result = await profileService.updateAdminProfile(adminId, username, email);

    if (!result.success) {
      const statusCode = result.message.includes("bulunamadı") ? 404 : 400;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.json({
      message: result.message,
      admin: result.data
    });
  } catch (error) {
    console.error("Update admin profile controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    const result = await profileService.getAdminStats(adminId);

    if (!result.success) {
      const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.json({
      message: result.message,
      stats: result.data
    });
  } catch (error) {
    console.error("Get admin stats controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

export const getProfileSecurity = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    const result = await profileService.checkProfileSecurity(adminId);

    if (!result.success) {
      const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.json({
      message: result.message,
      security: result.data
    });
  } catch (error) {
    console.error("Get profile security controller hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};

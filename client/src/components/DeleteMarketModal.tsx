import React from "react";
import { FiAlertTriangle, FiX, FiTrash2 } from "react-icons/fi";

interface Market {
  id: number;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  hasProducts: boolean;
  hasSolutions: boolean;
  hasCertificates: boolean;
}

interface DeleteMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  market: Market | null;
  isLoading: boolean;
}

const DeleteMarketModal: React.FC<DeleteMarketModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  market,
  isLoading
}) => {
  if (!isOpen || !market) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiAlertTriangle className="text-red-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Market Silme Onayı
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Bu market'i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            
            {/* Market Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0 h-12 w-12">
                  {market.imageUrl ? (
                    <img 
                      className="h-12 w-12 rounded-lg object-cover" 
                      src={`http://localhost:5000${market.imageUrl}`}
                      alt={market.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <FiTrash2 className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{market.name}</h4>
                  <p className="text-sm text-gray-500">Slug: {market.slug}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Durum:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    market.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {market.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sıralama:</span>
                  <span className="font-medium">{market.order}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">İçerikler:</span>
                  <div className="flex space-x-1">
                    {market.hasProducts && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Ürünler
                      </span>
                    )}
                    {market.hasSolutions && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Çözümler
                      </span>
                    )}
                    {market.hasCertificates && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sertifikalar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Dikkat!</h4>
                <p className="text-sm text-red-700 mt-1">
                  Bu market silindiğinde, tüm içerikleri ve çevirileri de kalıcı olarak silinecektir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Siliniyor...</span>
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                <span>Market'i Sil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMarketModal; 
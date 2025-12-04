'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

interface GoogleMapsPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
  initialAddress?: string;
}

export function GoogleMapsPicker({ onLocationSelect, onClose, initialAddress }: GoogleMapsPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [searchBox, setSearchBox] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setLoading(false);
      return;
    }

    // Load Google Maps script
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError('Failed to load Google Maps');
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    try {
      // Default center: RS UNIPDU Medika, Ponorogo
      const defaultCenter = { lat: -7.8653, lng: 111.4619 };

      // Initialize map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Initialize geocoder
      const geocoderInstance = new google.maps.Geocoder();

      // Initialize marker
      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Handle marker drag
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          reverseGeocode(position.lat(), position.lng(), geocoderInstance);
        }
      });

      // Handle map click
      mapInstance.addListener('click', (e: any) => {
        if (e.latLng) {
          markerInstance.setPosition(e.latLng);
          reverseGeocode(e.latLng.lat(), e.latLng.lng(), geocoderInstance);
        }
      });

      // Initialize search box
      if (searchInputRef.current) {
        const searchBoxInstance = new google.maps.places.SearchBox(searchInputRef.current);
        
        // Bias results to map viewport
        mapInstance.addListener('bounds_changed', () => {
          searchBoxInstance.setBounds(mapInstance.getBounds());
        });

        // Handle place selection
        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (!places || places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          // Set marker and map center
          markerInstance.setPosition(place.geometry.location);
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(15);

          // Update selected location
          setSelectedAddress(place.formatted_address || place.name || '');
          setSelectedLat(place.geometry.location.lat());
          setSelectedLng(place.geometry.location.lng());
        });

        setSearchBox(searchBoxInstance);
      }

      setMap(mapInstance);
      setMarker(markerInstance);
      setGeocoder(geocoderInstance);
      setLoading(false);

      // If initial address provided, geocode it
      if (initialAddress) {
        geocodeAddress(initialAddress, geocoderInstance, mapInstance, markerInstance);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  const reverseGeocode = (lat: number, lng: number, geocoderInstance: any) => {
    geocoderInstance.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        setSelectedAddress(results[0].formatted_address);
        setSelectedLat(lat);
        setSelectedLng(lng);
      }
    });
  };

  const geocodeAddress = (
    address: string,
    geocoderInstance: any,
    mapInstance: any,
    markerInstance: any
  ) => {
    geocoderInstance.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.setCenter(location);
        mapInstance.setZoom(15);
        markerInstance.setPosition(location);
        setSelectedAddress(results[0].formatted_address);
        setSelectedLat(location.lat());
        setSelectedLng(location.lng());
      }
    });
  };

  const handleConfirm = () => {
    if (selectedAddress && selectedLat && selectedLng) {
      onLocationSelect(selectedAddress, selectedLat, selectedLng);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onClose} variant="secondary">
          Tutup
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Box */}
      <div className="p-4 border-b">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Cari lokasi (contoh: Jl. Sudirman, Ponorogo)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Ketik alamat dan pilih dari dropdown, atau klik langsung di peta
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Memuat Google Maps...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Selected Location Display */}
      {selectedAddress && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <p className="text-sm font-medium text-green-900 mb-1">📍 Lokasi Dipilih:</p>
          <p className="text-sm text-green-800">{selectedAddress}</p>
          {selectedLat && selectedLng && (
            <p className="text-xs text-green-600 mt-1">
              Koordinat: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t flex gap-3">
        <Button
          onClick={handleConfirm}
          disabled={!selectedAddress}
          className="flex-1"
        >
          ✓ Gunakan Lokasi Ini
        </Button>
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Batal
        </Button>
      </div>
    </div>
  );
}


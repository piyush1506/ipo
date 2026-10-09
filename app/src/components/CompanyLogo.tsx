import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { getBrandPalette, getCompanyInitials } from '../utils/ipoHelpers';
import { getActiveBaseUrl } from '../api/ipoApi';

interface CompanyLogoProps {
  companyName: string;
  symbol?: string;
  logoUrl?: string;
  size?: number;
  style?: ViewStyle;
}


export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyName,
  symbol,
  logoUrl: propLogoUrl,
  size = 44,
  style,
}) => {
  const [candidateUrls, setCandidateUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isExhausted, setIsExhausted] = useState<boolean>(false);
  const [renderMode, setRenderMode] = useState<'image' | 'svg'>('image');

  const brand = getBrandPalette(companyName);
  const initials = getCompanyInitials(companyName);

  useEffect(() => {
    let active = true;

    getActiveBaseUrl().then((baseUrl) => {
      if (!active) return;

      const candidates: string[] = [];

      // 1. Explicit prop logoUrl if passed
      if (propLogoUrl && propLogoUrl.startsWith('http')) {
        candidates.push(propLogoUrl);
      }

      // 2. Backend Logo Proxy URL
      const query = new URLSearchParams({
        companyName,
        ...(symbol ? { symbol } : {}),
      });
      candidates.push(`${baseUrl}/api/company-logo?${query.toString()}`);

      const unique = Array.from(new Set(candidates.filter(Boolean)));

      setCandidateUrls(unique);
      setCurrentIndex(0);
      setIsExhausted(false);
      setRenderMode(unique[0]?.endsWith('.svg') ? 'svg' : 'image');
    });

    return () => {
      active = false;
    };
  }, [companyName, symbol, propLogoUrl]);

  const handleError = useCallback(() => {
    if (renderMode === 'image' && candidateUrls[currentIndex]?.endsWith('.svg')) {
      setRenderMode('svg');
      return;
    }

    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= candidateUrls.length) {
        setIsExhausted(true);
      } else {
        setRenderMode(candidateUrls[next]?.endsWith('.svg') ? 'svg' : 'image');
      }
      return next;
    });
  }, [candidateUrls, currentIndex, renderMode]);

  const currentUrl = candidateUrls[currentIndex];
  const borderRadius = size * 0.28;
  const fontSize = size * 0.34;

  // Show styled brand avatar if list is exhausted or no URL available
  if (isExhausted || !currentUrl) {
    return (
      <View
        style={[
          styles.initialsContainer,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: brand.bg,
            borderColor: brand.border,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.initialsText,
            {
              fontSize,
              color: brand.text,
            },
          ]}
        >
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.logoContainer,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: '#FFFFFF',
        },
        style,
      ]}
    >
      {renderMode === 'svg' ? (
        <SvgUri
          uri={currentUrl}
          width={size - 6}
          height={size - 6}
          onError={handleError}
        />
      ) : (
        <Image
          source={{ uri: currentUrl, cache: 'force-cache' }}
          style={[
            styles.logoImage,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: borderRadius - 2,
            },
          ]}
          resizeMode="contain"
          onError={handleError}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    backgroundColor: 'transparent',
  },
});


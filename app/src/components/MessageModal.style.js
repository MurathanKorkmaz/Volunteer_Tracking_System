import React from 'react';
import { StyleSheet, View } from 'react-native';

// Modern renk şeması (duruma göre)
export const getTypeColors = (type) => {
  const map = {
    info:    { fg: '#3B82F6', bg: '#E8F0FE' },
    success: { fg: '#10B981', bg: '#E6FAF3' },
    warning: { fg: '#F59E0B', bg: '#FFF7E6' },
    error:   { fg: '#EF4444', bg: '#FDECEC' },
  };
  return map[type] || map.info;
};

// Basit simge (ikon kütüphanesi eklemeden)
export const Icon = ({ type = 'info', color = '#3B82F6', size = 22 }) => {
  const dot = { width: size, height: size, borderRadius: size / 2, backgroundColor: color };
  const bar = { width: 2, height: size * 0.52, backgroundColor: color, borderRadius: 2 };

  if (type === 'success') {
    // check
    return (
      <View style={{ width: size * 1.2, height: size * 1.2, transform: [{ rotate: '-45deg' }] }}>
        <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.6, width: 2, height: size * 0.35, backgroundColor: color, borderRadius: 2 }} />
        <View style={{ position: 'absolute', left: size * 0.34, top: size * 0.35, width: 2, height: size * 0.7, backgroundColor: color, borderRadius: 2 }} />
      </View>
    );
  }

  if (type === 'warning') {
    // ünlem üçgeni
    return (
      <View style={{ width: size * 1.2, height: size * 1.1, alignItems: 'center' }}>
        <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.6, borderRightWidth: size * 0.6, borderBottomWidth: size * 1.05, borderStyle: 'solid', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, opacity: 0.9 }} />
        <View style={{ position: 'absolute', top: size * 0.35 }}>
          <View style={[bar, { height: size * 0.45, backgroundColor: '#fff' }]} />
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginTop: 3, alignSelf: 'center' }} />
        </View>
      </View>
    );
  }

  if (type === 'error') {
    // çarpı
    return (
      <View style={{ width: size * 1.1, height: size * 1.1 }}>
        <View style={{ position: 'absolute', width: 2, height: size, backgroundColor: color, transform: [{ rotate: '45deg' }], left: '50%', marginLeft: -1 }} />
        <View style={{ position: 'absolute', width: 2, height: size, backgroundColor: color, transform: [{ rotate: '-45deg' }], left: '50%', marginLeft: -1 }} />
      </View>
    );
  }

  // info
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={dot} />
      <View style={[bar, { marginTop: 4 }]} />
    </View>
  );
};

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,16,20,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#334155',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
  },
  secondaryText: {
    color: '#0F172A',
  },
});

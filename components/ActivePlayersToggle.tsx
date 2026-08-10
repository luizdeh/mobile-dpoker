import React from 'react';
import { HStack, Text, Switch, Pressable } from 'native-base';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

// Compact header-right control shared by Stats, PlayerStats and Matchups so
// the "only active players" filter lives in the same spot on every screen.
// Renders on the white header bar, not the app's black page background.
export default function ActivePlayersToggle({ value, onChange }: Props) {
  return (
    <Pressable onPress={() => onChange(!value)} pr={2}>
      <HStack alignItems="center" space={1.5}>
        <Text fontSize="9" bold letterSpacing="sm" color={value ? 'teal.600' : 'blueGray.400'}>
          ACTIVE
        </Text>
        <Switch size="sm" isChecked={value} onToggle={() => onChange(!value)} colorScheme="teal" />
      </HStack>
    </Pressable>
  );
}

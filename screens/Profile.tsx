import React, { useState } from "react";
import { Text, Center, VStack, Input, Button } from "native-base";
import useAuthContext from "../context/useAuthContext";

export default function Profile() {
  const { session, role, signIn, signOut } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setSubmitting(false);
  };

  if (session) {
    return (
      <Center flex={1} px={8}>
        <VStack space={4} alignItems="center" w="100%">
          <Text fontSize="md">{session.user.email}</Text>
          <Text fontSize="xs" color="blueGray.400">{role?.toUpperCase() ?? "NO ROLE ASSIGNED"}</Text>
          <Button onPress={signOut} colorScheme="blueGray" width="60%">
            SIGN OUT
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Center flex={1} px={8}>
      <VStack space={4} w="100%">
        <Input
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          backgroundColor="white"
        />
        <Input
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          backgroundColor="white"
        />
        {error ? <Text color="red.400">{error}</Text> : null}
        <Button
          onPress={handleSignIn}
          isDisabled={!email.length || !password.length || submitting}
          colorScheme="blueGray"
        >
          SIGN IN
        </Button>
      </VStack>
    </Center>
  );
}

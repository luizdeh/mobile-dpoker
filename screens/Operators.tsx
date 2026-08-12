import React, { useEffect, useState } from "react";
import { Box, Text, VStack, HStack, Input, Button, Select, Center, Spinner } from "native-base";
import { ScrollView } from "react-native";
import useAuthContext from "../context/useAuthContext";
import { getProfiles } from "../utils/db/getProfiles";
import { createOperator } from "../utils/db/createOperator";
import { updateProfileRole } from "../utils/db/updateProfileRole";
import { removeProfile } from "../utils/db/removeProfile";
import { Profile } from "../lib/types";

export default function Operators() {
  const { session, role } = useAuthContext();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "operator">("operator");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadProfiles = async () => {
    setIsLoading(true);
    const data = await getProfiles();
    setProfiles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (role === "admin") loadProfiles();
  }, [role]);

  const handleCreate = async () => {
    setCreateError(null);
    setCreateSuccess(null);
    if (password.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }
    setCreating(true);
    const { error } = await createOperator(email.trim(), password, newRole, displayName.trim() || undefined);
    setCreating(false);
    if (error) {
      setCreateError(error);
      return;
    }
    setCreateSuccess(`Account created for ${email.trim()}.`);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setNewRole("operator");
    loadProfiles();
  };

  const handleRoleChange = async (id: string, value: string) => {
    const nextRole = value as "admin" | "operator";
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role: nextRole } : p)));
    const ok = await updateProfileRole(id, nextRole);
    if (!ok) loadProfiles();
  };

  const handleRemove = async (id: string) => {
    const ok = await removeProfile(id);
    if (ok) setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  if (role !== "admin") {
    return (
      <Center flex={1} backgroundColor="black">
        <Text color="blueGray.400">Only admins can manage operators.</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} backgroundColor="black" px={4} py={4}>
      <ScrollView>
        <VStack space={2} mb={6}>
          <Text fontSize="10" color="blueGray.400">CREATE ACCOUNT</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="EMAIL"
            autoCapitalize="none"
            keyboardType="email-address"
            color="white"
            placeholderTextColor="blueGray.400"
            borderColor="blueGray.700"
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="PASSWORD"
            secureTextEntry
            color="white"
            placeholderTextColor="blueGray.400"
            borderColor="blueGray.700"
          />
          <Input
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="DISPLAY NAME (OPTIONAL)"
            color="white"
            placeholderTextColor="blueGray.400"
            borderColor="blueGray.700"
          />
          <Select
            color="white"
            placeholderTextColor="blueGray.400"
            borderColor="blueGray.700"
            selectedValue={newRole}
            onValueChange={(value) => setNewRole(value as "admin" | "operator")}
          >
            <Select.Item label="OPERATOR" value="operator" />
            <Select.Item label="ADMIN" value="admin" />
          </Select>
          {createError ? <Text color="red.400" fontSize="xs">{createError}</Text> : null}
          {createSuccess ? <Text color="emerald.400" fontSize="xs">{createSuccess}</Text> : null}
          <Button
            onPress={handleCreate}
            isDisabled={!email.trim().length || !password.length || creating}
            colorScheme="teal"
          >
            {creating ? "CREATING..." : "CREATE ACCOUNT"}
          </Button>
        </VStack>

        <Text fontSize="10" color="blueGray.400" mb={2}>CURRENT ACCOUNTS</Text>
        {isLoading ? (
          <Center py={8}>
            <Spinner color="emerald.600" />
          </Center>
        ) : (
          <VStack space={2}>
            {profiles.map((profile) => {
              const isSelf = profile.id === session?.user.id;
              return (
                <VStack
                  key={profile.id}
                  backgroundColor="blueGray.800"
                  borderRadius="sm"
                  px={3}
                  py={2}
                  space={2}
                >
                  <VStack>
                    <Text color="white" fontSize="sm" bold>
                      {profile.display_name || profile.email || profile.id}
                    </Text>
                    {profile.email ? (
                      <Text color="blueGray.400" fontSize="xs">{profile.email}</Text>
                    ) : null}
                  </VStack>
                  <HStack space={2}>
                    <Select
                      flex={1}
                      color="white"
                      selectedValue={profile.role}
                      isDisabled={isSelf}
                      onValueChange={(value) => handleRoleChange(profile.id, value)}
                    >
                      <Select.Item label="OPERATOR" value="operator" />
                      <Select.Item label="ADMIN" value="admin" />
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="danger"
                      isDisabled={isSelf}
                      onPress={() => handleRemove(profile.id)}
                    >
                      REMOVE
                    </Button>
                  </HStack>
                </VStack>
              );
            })}
            {!profiles.length ? (
              <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={4}>
                No profiles found yet.
              </Text>
            ) : null}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

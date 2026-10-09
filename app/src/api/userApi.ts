const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface User {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
  picture?: string;
}

export interface PanAccount {
  _id: string;
  panNumber: string;
  name: string;
}

export async function loginUser(email: string, name: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function fetchUserPans(userId: string): Promise<PanAccount[]> {
  const response = await fetch(`${BASE_URL}/users/${userId}/pans`);
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function addUserPan(userId: string, panNumber: string, name: string): Promise<PanAccount[]> {
  const response = await fetch(`${BASE_URL}/users/${userId}/pans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ panNumber, name }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function deleteUserPan(userId: string, panId: string): Promise<PanAccount[]> {
  const response = await fetch(`${BASE_URL}/users/${userId}/pans/${panId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function updatePushToken(userId: string, pushToken: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/users/${userId}/push-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pushToken }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
}

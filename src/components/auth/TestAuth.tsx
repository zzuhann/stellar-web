'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function TestAuth() {
  const [result, setResult] = useState<string>('');

  const testFirebase = async () => {
    try {
      setResult('測試中...');
      
      // 測試用的隨機 email
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'password123';
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      setResult(`成功！User ID: ${userCredential.user.uid}`);
    } catch (error: any) {
      setResult(`錯誤: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <button 
        onClick={testFirebase}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
      >
        測試 Firebase Auth
      </button>
      <div className="mt-2 text-sm">
        結果: {result}
      </div>
    </div>
  );
}
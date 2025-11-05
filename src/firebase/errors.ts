'use client';
import { getAuth, type User } from 'firebase/auth';

/**
 * @fileoverview Пользовательский класс ошибки, предназначенный для отладки ошибок разрешений Firestore.
 * Он структурирует информацию об ошибке так, чтобы имитировать объект запроса, доступный в правилах безопасности Firestore.
 */

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Создает объект auth, совместимый с правилами безопасности, из пользователя Firebase.
 * @param {User | null} currentUser - Текущий аутентифицированный пользователь Firebase.
 * @returns {FirebaseAuthObject | null} - Объект, который отражает request.auth в правилах безопасности, или null.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Создает полный, смоделированный объект запроса для сообщения об ошибке.
 * Безопасно пытается получить текущего аутентифицированного пользователя.
 * @param {SecurityRuleContext} context - Контекст неудачной операции Firestore.
 * @returns {SecurityRuleRequest} - Структурированный объект запроса.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Безопасная попытка получить текущего пользователя.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // Это перехватит ошибки, если приложение Firebase еще не инициализировано.
    // В этом случае мы продолжим без информации об аутентификации.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Создает окончательное, отформатированное сообщение об ошибке для LLM.
 * @param {SecurityRuleRequest} requestObject - Смоделированный объект запроса.
 * @returns {string} - Строка, содержащая сообщение об ошибке и полезную нагрузку JSON.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Отсутствуют или недостаточны права доступа: следующий запрос был отклонен правилами безопасности Firestore:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * Пользовательский класс ошибки, предназначенный для использования LLM для отладки.
 * Он структурирует информацию об ошибке, чтобы имитировать объект запроса,
 * доступный в правилах безопасности Firestore.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirebaseError';
    this.request = requestObject;
  }
}

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider"

const client = new CognitoIdentityProviderClient({
  region: process.env.APP_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
  },
})

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!

export async function cognitoSignUp(email: string, password: string, name: string, role: string) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
      { Name: "custom:role", Value: role },
    ],
  })
  return client.send(command)
}

export async function cognitoConfirmSignUp(email: string, code: string) {
  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  })
  return client.send(command)
}

export async function cognitoSignIn(email: string, password: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  })
  return client.send(command)
}

export async function cognitoForgotPassword(email: string) {
  const command = new ForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
  })
  return client.send(command)
}

export async function cognitoConfirmForgotPassword(email: string, code: string, newPassword: string) {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  })
  return client.send(command)
}

export async function cognitoDeleteUser(accessToken: string) {
  const command = new GlobalSignOutCommand({ AccessToken: accessToken })
  await client.send(command)

  // Admin delete requires knowing the username — fetch it first
}

export async function cognitoAdminDeleteUser(email: string) {
  const command = new AdminDeleteUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
  })
  return client.send(command)
}

export async function cognitoAddUserToGroup(email: string, groupName: string) {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    GroupName: groupName,
  })
  return client.send(command)
}

export async function cognitoGetUser(email: string) {
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
  })
  return client.send(command)
}

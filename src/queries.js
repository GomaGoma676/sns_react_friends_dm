import gql from "graphql-tag";

export const CREATE_USER = gql`
  mutation($username: String!, $password: String!) {
    createUser(input: { username: $username, password: $password, email: "" }) {
      user {
        id
        username
      }
    }
  }
`;
export const GET_TOKEN = gql`
  mutation($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;
export const CREATE_PROFILE = gql`
  mutation {
    createProfile(input: {}) {
      profile {
        id
        userProf {
          username
        }
      }
    }
  }
`;
export const GET_PROFILES = gql`
  query {
    allProfiles {
      edges {
        node {
          id
          userProf {
            id
            username
          }
          friends {
            edges {
              node {
                id
                username
              }
            }
          }
          friendRequests {
            edges {
              node {
                id
                username
              }
            }
          }
        }
      }
    }
  }
`;
export const GET_MYPROFILE = gql`
  query {
    profile {
      id
      userProf {
        id
        username
      }
      friends {
        edges {
          node {
            id
            username
          }
        }
      }
      friendRequests {
        edges {
          node {
            id
            username
            profile {
              id
            }
            profilesFriends {
              edges {
                node {
                  id
                  userProf {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
export const UPDATE_FRIENDS = gql`
  mutation($id: ID!, $friends: [ID!]) {
    updateProfile(input: { id: $id, friends: $friends }) {
      profile {
        id
        userProf {
          username
        }
        friends {
          edges {
            node {
              username
            }
          }
        }
      }
    }
  }
`;
export const UPDATE_REQUESTS = gql`
  mutation($id: ID!, $friendRequests: [ID!]) {
    updateProfile(input: { id: $id, friendRequests: $friendRequests }) {
      profile {
        id
        userProf {
          username
        }
        friendRequests {
          edges {
            node {
              username
            }
          }
        }
      }
    }
  }
`;
export const GET_MESSAGES = gql`
  query($receiver: ID!) {
    allMessages(receiver: $receiver) {
      edges {
        node {
          id
          message
          sender {
            id
            username
          }
          receiver {
            id
            username
          }
        }
      }
    }
  }
`;
export const CREATE_MESSAGE = gql`
  mutation($message: String!, $receiver: ID!) {
    createMessage(input: { message: $message, receiver: $receiver }) {
      message {
        message
      }
    }
  }
`;

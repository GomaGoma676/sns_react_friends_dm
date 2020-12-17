import React, { useState, useEffect } from "react";
import styles from "./MainPage.module.css";
import { useHistory } from "react-router-dom";
import SendIcon from "@material-ui/icons/Send";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { useQuery } from "@apollo/react-hooks";
import { useMutation } from "@apollo/client";
import { useLazyQuery } from "@apollo/client";
import {
  GET_MYPROFILE,
  GET_PROFILES,
  GET_MESSAGES,
  UPDATE_FRIENDS,
  UPDATE_REQUESTS,
  CREATE_MESSAGE,
} from "../queries";
import {
  Grid,
  Modal,
  makeStyles,
  TextField,
  IconButton,
} from "@material-ui/core";

const getModalStyle = () => {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const useStyles = makeStyles((theme) => ({
  modal: {
    outline: "none",
    position: "absolute",
    width: 250,
    borderRadius: 3,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
  },
}));

const MainPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [dm, setDm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState("");

  const { data: dataMyProfile, error: errorMyProfile } = useQuery(
    GET_MYPROFILE,
    {
      fetchPolicy: "cache-and-network",
    }
  );
  const { data: dataProfiles, error: errorProfiles } = useQuery(GET_PROFILES, {
    fetchPolicy: "cache-and-network",
  });

  const [getDMs, { data: dataMsgs }] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: "cache-and-network",
  });

  const [updateFriends] = useMutation(UPDATE_FRIENDS);
  const [updateRequests] = useMutation(UPDATE_REQUESTS);
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const myFriends = dataMyProfile?.profile.friends.edges.map(
    ({ node }) => node.id
  );
  const myFriendRequests = dataMyProfile?.profile.friendRequests.edges.map(
    ({ node }) => node.id
  );
  const approveRequest = async (node) => {
    await updateFriends({
      variables: {
        id: dataMyProfile.profile.id,
        friends: [...myFriends, node.id],
      },
    });
    await updateFriends({
      variables: {
        id: node.profile.id,
        friends: [
          ...node.profilesFriends.edges.map(({ node }) => node.userProf.id),
          dataMyProfile.profile.userProf.id,
        ],
      },
    });
    await updateRequests({
      variables: {
        id: dataMyProfile.profile.id,
        friendRequests: myFriendRequests.filter(
          (friendRequestId) => friendRequestId !== node.id
        ),
      },
    });
  };

  const createDM = async () => {
    await createMessage({
      variables: {
        message: dm,
        receiver: selectedReceiver,
      },
    });
    setDm("");
    setSelectedReceiver("");
    setOpenModal(false);
  };

  useEffect(() => {
    if (dataMyProfile?.profile.userProf.id) {
      getDMs({ variables: { receiver: dataMyProfile?.profile.userProf.id } });
    }
  }, [dataMyProfile?.profile.userProf.id, getDMs]);

  return (
    <div className={styles.mainPage__root}>
      {(errorMyProfile || errorProfiles) && (
        <h3>
          {errorProfiles?.message}/{errorMyProfile?.message}
        </h3>
      )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div style={getModalStyle()} className={classes.modal}>
          <div className={styles.mainPage__modal}>
            <TextField
              InputLabelProps={{
                shrink: true,
              }}
              label="DM"
              type="text"
              value={dm}
              onChange={(e) => {
                setDm(e.target.value);
              }}
            />
            <IconButton onClick={() => createDM()}>
              <SendIcon />
            </IconButton>
          </div>
        </div>
      </Modal>
      <Grid container>
        <Grid item xs>
          {dataMyProfile?.profile.userProf.username}
        </Grid>
        <Grid item xs>
          <span className={styles.mainPage__title}>Friends system </span>
        </Grid>
        <Grid item xs>
          <ExitToAppIcon
            className={styles.mainPage__out}
            onClick={() => {
              localStorage.removeItem("token");
              history.push("/");
            }}
          />
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={3}>
          <h3>My friends</h3>
          <ul className={styles.mainPage__list}>
            {dataMyProfile?.profile.friends.edges.map(({ node }) => (
              <li className={styles.mainPage__item} key={node.id}>
                {node.username}
                <button
                  onClick={() => {
                    setSelectedReceiver(node.id);
                    setOpenModal(true);
                  }}
                >
                  dm send
                </button>
              </li>
            ))}
          </ul>
        </Grid>
        <Grid item xs={3}>
          <h3>Profile list</h3>
          <ul className={styles.mainPage__list}>
            {dataProfiles?.allProfiles.edges.map(
              ({ node }) =>
                node.id !== dataMyProfile?.profile.id && (
                  <li className={styles.mainPage__item} key={node.id}>
                    {node.userProf.username}
                    <button
                      disabled={
                        myFriends?.includes(node.userProf.id) |
                        myFriendRequests?.includes(node.userProf.id) |
                        node.friendRequests.edges
                          .map(({ node }) => node.id)
                          .includes(dataMyProfile?.profile.userProf.id)
                      }
                      onClick={async () => {
                        await updateRequests({
                          variables: {
                            id: node.id,
                            friendRequests: [
                              ...node.friendRequests.edges.map(
                                ({ node }) => node.id
                              ),
                              dataMyProfile?.profile.userProf.id,
                            ],
                          },
                        });
                      }}
                    >
                      {myFriends?.includes(node.userProf.id) |
                      myFriendRequests?.includes(node.userProf.id) |
                      node.friendRequests.edges
                        .map(({ node }) => node.id)
                        .includes(dataMyProfile?.profile.userProf.id)
                        ? "requested"
                        : "request"}
                    </button>
                  </li>
                )
            )}
          </ul>
        </Grid>
        <Grid item xs={3}>
          <h3>Friend requests by</h3>
          <ul className={styles.mainPage__list}>
            {dataMyProfile?.profile.friendRequests.edges.map(({ node }) => (
              <li className={styles.mainPage__item} key={node.id}>
                {node.username}
                <button
                  onClick={async () => {
                    await approveRequest(node);
                  }}
                >
                  approve
                </button>
              </li>
            ))}
          </ul>
        </Grid>
        <Grid item xs={3}>
          <h3>DM</h3>
          <ul className={styles.mainPage__list}>
            {dataMsgs?.allMessages.edges.map(({ node }) => (
              <li className={styles.mainPage__item} key={node.id}>
                {node.message}
                <div>
                  <strong>{node.sender.username}</strong>
                  <button
                    className={styles.mainPage__btn}
                    onClick={() => {
                      setSelectedReceiver(node.sender.id);
                      setOpenModal(true);
                    }}
                  >
                    reply
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Grid>
      </Grid>
    </div>
  );
};

export default MainPage;

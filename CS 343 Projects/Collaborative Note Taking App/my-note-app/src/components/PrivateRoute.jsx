import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_QUERY } from "./queries"; 
import { Spinner, Flex } from "@chakra-ui/react";

const PrivateRoute = ({ children }) => {
  const { data, loading, error } = useQuery(GET_USER_QUERY);

  if (loading) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error || !data?.me) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

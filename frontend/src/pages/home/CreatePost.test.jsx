import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import CreatePost from "./CreatePost";

it("renders without crashing", function() {
  render(<CreatePost />);
});
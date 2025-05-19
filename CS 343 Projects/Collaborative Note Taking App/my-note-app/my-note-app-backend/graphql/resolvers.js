const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../config/db");
const { throwServerError } = require("@apollo/client");
require("dotenv").config();

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    getNotes: async (_, __, { user }) => {
      if (!user) throw new Error("You are not authenticated!");
      const notes = [];
      const { data: permissions, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("user_id", user.id);
      console.log("user_id", user.id);
      console.log("Permissions:", permissions);

      if (!permissions) {
        console.error("User does not have any notes");
        throw new Error("User does not have any notes");
      }

      if (error) {
        throw new Error(error.message);
      }

      for (const permission of permissions) {
        console.log(permission.note_id);
        const { data: note, error } = await supabase
          .from("notes")
          .select("*")
          .eq("note_id", permission.note_id)
          .single();

        if (error) {
          console.error("Cannot fetch note:", error.message);
          throw new Error(error.message);
        }

        notes.push(note);
      }

      if (!notes) {
        console.error("User does not have any notes");
        throw new Error("User does not have any notes");
      }

      console.log("Notes:", notes);

      return { notes, permissions };
    },
    getUserCategories: async (_, __, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .eq("owner_id", user.id);

      if (error) {
        console.error("Error fetching categories:", error.message);
        throw new Error(error.message);
      }

      return categories;
    },
    checkEmail: async (_, { email }) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });

      return { token: token };
    },
  },
  Mutation: {
    shareNote: async (_, { noteId, username, permission }, { user }) => {
      // Check if the user is authenticated
      if (!user) throw new Error("You are not authenticated!");

      // Fetch the user by username
      const { data: invitedUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user by username:", userError.message);
        throw new Error("Error fetching user. Please try again.");
      }

      if (!invitedUser) {
        throw new Error("User not found. Please check the username.");
      }

      // Check if the note exists and the user has permission to share it
      const { data: note, error: noteError } = await supabase
        .from("notes")
        .select("*")
        .eq("note_id", noteId)
        .single();

      if (noteError) {
        console.error("Cannot fetch note:", noteError.message);
        throw new Error("Error fetching note. Please try again.");
      }

      if (!note) {
        throw new Error("Note not found. Please check the note ID.");
      }

      // Share the note with the invited user
      const { error: shareError } = await supabase.from("permissions").insert([
        {
          user_id: invitedUser.id,
          note_id: note.note_id,
          permission: permission,
        },
      ]);

      console.log(`Note ${noteId} shared with ${username} successfully!`);
      return true;
    },

    username: async (_, { username }) => {
      try {
        console.log("Checking username...");
        const { data: existingUsername, error: usernameError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        // Handle errors appropriately
        if (usernameError && usernameError.code !== "PGRST116") {
          throw new Error(usernameError.message);
        }

        if (!existingUsername) {
          return null;
        }

        // Return user data directly
        return existingUsername;
      } catch (error) {
        console.error("Error checking username:", error);
        throw new Error("Failed to check username. Please try again.");
      }
    },

    signup: async (_, { username, email, password }) => {
      try {
        // Check if the username already exists
        const { data: existingUsername, error: usernameError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (usernameError && usernameError.code !== "PGRST116") {
          throw new Error(usernameError.message);
        }

        if (existingUsername) {
          throw new Error("Username already exists");
          error.message = "Username already exists";
        }

        // Check if the email already exists
        const { data: existingEmail, error: emailError } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (emailError && emailError.code !== "PGRST116") {
          throw new Error(emailError.message);
        }

        if (existingEmail) {
          throw new Error("Email already exists");
          error.message = "Email already exists";
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([{ username, email, password: hashedPassword }])
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Generate a JWT token for the user
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        // Return the token and user information
        return {
          token,
          user: newUser,
        };
      } catch (error) {
        console.error("Signup error:", error);
        throw new Error(
          error.message || "Failed to create account. Please try again."
        );
      }
    },
    login: async (_, { username, password }) => {
      try {
        // Check if the user exists
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (error) {
          throw new Error("No user with that username");
        }

        const user = data;

        // Compare the provided password with the stored password
        console.log("User:", user);
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          throw new Error("Incorrect password");
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        return {
          token,
          user,
        };
      } catch (err) {
        console.error("Login error:", err);
        throw new Error("Login failed");
      }
    },

    updateProfile: async (_, { input }, { user }) => {
      try {
        // Ensure the user is authenticated
        if (!user) {
          return {
            user: null,
            errors: [{ field: "auth", message: "Not authenticated" }],
          };
        }

        const { username, email } = input;

        // Perform the update operation using Supabase
        const { data: updatedUser, error } = await supabase
          .from("users")
          .update({ username, email })
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Profile update error:", error);
          return {
            user: null,
            errors: [
              {
                field: "general",
                message: error.message || "An unexpected error occurred",
              },
            ],
          };
        }

        return {
          user: updatedUser,
          errors: [],
        };
      } catch (error) {
        console.error("Profile update error:", error);
        return {
          user: null,
          errors: [
            {
              field: "general",
              message: error.message || "An unexpected error occurred",
            },
          ],
        };
      }
    },
    createNote: async (_, { title, content }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      const { data: note, error: noteError } = await supabase
        .from("notes")
        .insert([{ title, content }])
        .select()
        .single();
      if (!note) {
        console.error("Note creation failed, no note returned");
        throw new Error("Note creation failed");
      }
      if (noteError) {
        throw new Error(noteError.message);
      }

      console.log("Note created successfully:", note);

      // Create a new permission for the note
      const { data: permission, error: permissionError } = await supabase
        .from("permissions")
        .insert([
          { note_id: note.note_id, user_id: user.id, permission: "owner" },
        ])
        .select()
        .single();

      if (permissionError) {
        throw new Error(permissionError.message);
      }

      return { note, permission };
    },
    addPermission: async (_, { note_id, user_id, permission }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("note_id", note_id)
        .single();

      if (!data) {
        console.error("Note does not exist");
        throw new Error("Note does not exist");
      }

      if (error) {
        console.error("Error fetching note:", error.message);
        return null;
      }

      const { data: hasPermission, error: hasPermissionError } = await supabase
        .from("permissions")
        .select("*")
        .eq("note_id", note_id)
        .eq("user_id", user.id)
        .single();

      if (!hasPermission || hasPermission.permission != "owner") {
        console.error("User does not have required permissions");
        throw new Error("User does not have required permissions");
      }

      if (hasPermissionError) {
        console.error("Error fetching permission:", hasPermissionError.message);
        return null;
      }

      const { data: newPermission, error: permissionError } = await supabase
        .from("permissions")
        .insert([
          { note_id: note_id, user_id: user_id, permission: permission },
        ])
        .select()
        .single();

      if (permissionError) {
        throw new Error(permissionError);
      }

      return newPermission;
    },
    editNote: async (_, { note_id, content }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      // Check if the user has permission to edit the note
      const { data: permission, error: permissionError } = await supabase
        .from("permissions")
        .select("*")
        .eq("note_id", note_id)
        .eq("user_id", user.id)
        .single();
      console.log("This is the permission: ", permission.permission);
      if (!permission || permission.permission === "read") {
        console.error("User does not have required permissions");
        throw new Error("User does not have required permissions");
      }

      if (permissionError) {
        console.error("Error fetching permission:", permissionError.message);
        throw new Error(permissionError.message);
      }

      // Update the note
      const { data: updatedNote, error: updateError } = await supabase
        .from("notes")
        .update({ content, last_edited: new Date().toISOString() })
        .eq("note_id", note_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating note:", updateError.message);
        throw new Error(updateError.message);
      }

      console.log("Note updated successfully:", updatedNote);

      return updatedNote;
    },
    resetPassword: async (_, { password, token }) => {
      // Verify and decode the reset token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decodedToken);
      // Extract user ID from the decoded token
      const userId = decodedToken.id;
      console.log(userId);
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating password:", updateError.message);
        throw new Error(updateError.message);
      }

      return updatedUser;
    },
    deleteUser: async (_, __, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      try {
        // Get all the note IDs where the user is the owner
        const { data: userNotes, error: getNotesError } = await supabase
          .from("permissions")
          .select("note_id")
          .eq("user_id", user.id)
          .eq("permission", "owner");

        if (getNotesError) {
          console.error("Error fetching user's notes:", getNotesError.message);
          throw new Error("Failed to fetch user's notes");
        }

        const noteIds = userNotes.map((note) => note.note_id);

        if (noteIds.length > 0) {
          //Delete all permissions where the user is the user_id
          const { error: deleteUserPermissionsError } = await supabase
            .from("permissions")
            .delete()
            .eq("user_id", user.id);

          if (deleteUserPermissionsError) {
            console.error(
              "Error deleting user's permissions:",
              deleteUserPermissionsError.message
            );
            throw new Error("Failed to delete user's permissions");
          }

          //Delete all permissions where the note_id matches the notes owned by the user
          const { error: deleteNotePermissionsError } = await supabase
            .from("permissions")
            .delete()
            .in("note_id", noteIds);

          if (deleteNotePermissionsError) {
            console.error(
              "Error deleting permissions for user's notes:",
              deleteNotePermissionsError.message
            );
            throw new Error("Failed to delete permissions for user's notes");
          }

          // Delete the notes where the user is the owner
          const { error: deleteNotesError } = await supabase
            .from("notes")
            .delete()
            .in("note_id", noteIds);

          if (deleteNotesError) {
            console.error(
              "Error deleting user's notes:",
              deleteNotesError.message
            );
            throw new Error("Failed to delete user's notes");
          }
        }

        // Delete the user
        const { error: deleteUserError } = await supabase
          .from("users")
          .delete()
          .eq("id", user.id);

        if (deleteUserError) {
          console.error("Error deleting user:", deleteUserError.message);
          throw new Error("Failed to delete user");
        }

        return "User and all related data have been deleted successfully";
      } catch (err) {
        console.error("Error in deleteUser mutation:", err.message);
        throw new Error(
          err.message || "Failed to delete user and related data"
        );
      }
    },

    deleteNote: async (_, { note_id }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      // Check if the user has permission to delete the note
      const { data: permission, error: permissionError } = await supabase
        .from("permissions")
        .select("*")
        .eq("note_id", note_id)
        .eq("user_id", user.id)
        .single();

      if (!permission || permission.permission !== "owner") {
        console.error("User does not have required permissions");
        throw new Error("User does not have required permissions");
      }

      if (permissionError) {
        console.error("Error fetching permission:", permissionError.message);
        throw new Error(permissionError.message);
      }

      // Delete the permissions associated with the note
      const { error: deletePermissionsError } = await supabase
        .from("permissions")
        .delete()
        .eq("note_id", note_id);

      if (deletePermissionsError) {
        console.error(
          "Error deleting permissions:",
          deletePermissionsError.message
        );
        throw new Error(deletePermissionsError.message);
      }

      // Delete the note from the database
      const { data: deletedNote, error: deleteError } = await supabase
        .from("notes")
        .delete()
        .eq("note_id", note_id)
        .select()
        .single();

      if (deleteError) {
        console.error("Error deleting note:", deleteError.message);
        throw new Error(deleteError.message);
      }

      return "Note has been deleted successfully";
    },
    addCategory: async (_, { category_name }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      if (!category_name) {
        throw new Error("Category name cannot be null or empty");
      }

      // Check if the user already has a category with the same name
      const { data: existingCategory, error: existingCategoryError } =
        await supabase
          .from("categories")
          .select("*")
          .eq("owner_id", user.id)
          .eq("category_name", category_name)
          .single();

      if (existingCategoryError && existingCategoryError.code !== "PGRST116") {
        throw new Error(existingCategoryError.message);
      }

      if (existingCategory) {
        throw new Error("Category with that name already exists");
      }

      // Insert the new category with the owner_id
      const { data: newCategory, error: insertError } = await supabase
        .from("categories")
        .insert([{ category_name: category_name, owner_id: user.id }])
        .select()
        .single();

      console.log("New category:", newCategory);

      if (insertError) {
        console.error("Error adding category:", insertError.message);
        throw new Error(insertError.message);
      }

      return newCategory;
    },
    deleteCategory: async (_, { category_id }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");
      console.log("category_id:", category_id);
      // Check if the user has permission to delete the category
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("category_id", category_id)
        .single();

      if (!category || category.owner_id !== user.id) {
        console.error("User does not have required permissions");
        throw new Error("User does not have required permissions");
      }

      if (categoryError) {
        console.error("Error fetching category:", categoryError.message);
        throw new Error(categoryError.message);
      }

      const { data: notes, error: notesError } = await supabase
        .from("notes")
        .select("*")
        .eq("category_id", category_id);

      if (notesError) {
        console.error("Error fetching notes:", notesError.message);
        throw new Error(notesError.message);
      }

      // Remove the category_id from the notes
      for (const note of notes) {
        const { data: updatedNote, error: updateError } = await supabase
          .from("notes")
          .update({ category_id: null })
          .eq("note_id", note.note_id)
          .single();

        if (updateError) {
          console.error("Error updating note:", updateError.message);
          throw new Error(updateError.message);
        }
      }

      // Delete the category from the database
      const { data: deletedCategory, error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("category_id", category_id)
        .single();

      if (deleteError) {
        console.error("Error deleting category:", deleteError.message);
        throw new Error(deleteError.message);
      }

      return "Category has been deleted successfully";
    },
    addNoteToCategory: async (_, { note_id, category_name }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");
      console.log("1");
      // Check if the user has permission to add the category
      const { data: permission, error: permissionError } = await supabase
        .from("permissions")
        .select("*")
        .eq("note_id", note_id)
        .eq("user_id", user.id)
        .single();

      if (!permission || permission.permission !== "owner") {
        console.error("User does not have required permissions");
        throw new Error("User does not have required permissions");
      }

      if (permissionError) {
        console.error("Error fetching permission:", permissionError.message);
        throw new Error(permissionError.message);
      }
      console.log("2");
      // Check if the category exists
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("category_name", category_name)
        .single();

      if (!category) {
        console.error("Category does not exist");
        throw new Error("Category does not exist");
      }

      if (categoryError) {
        console.error("Error fetching category:", categoryError.message);
        throw new Error(categoryError.message);
      }
      console.log("3");
      // Check if user owns the category
      if (category.owner_id !== user.id) {
        console.error("User does not have required permissions");
        throw new Error("User does not have required permissions");
      }

      // Update the note with the category_id
      const { data: updatedNote, error: updateError } = await supabase
        .from("notes")
        .update({ category_id: category.category_id })
        .eq("note_id", note_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating note:", updateError.message);
        throw new Error(updateError.message);
      }

      return updatedNote;
    },
    editUser: async (_, { username, email }, { user }) => {
      if (!user) throw new Error("You are not authenticated!");

      // Update the user information
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ username, email })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user:", updateError.message);
        throw new Error(updateError.message);
      }

      return updatedUser;
    },
  },
};

module.exports = resolvers;

import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from "type-graphql";
import { UserUtils } from "../utils/UserUtils";
import { User } from "../entity/users";
import { Role } from "../entity/roles";
import { Shop } from "../entity/shops";
import { MyContext } from "../types/context";
import axios from "axios";

@ObjectType()
class UserResponse {
    @Field(() => User, { nullable: true })
    user?: User | null; // null case

    @Field(() => Boolean)
    success: boolean;

    @Field(() => String, { nullable: true })
    token?: string; // Auth token (JWT or access token)
}

@Resolver()
export class UserResolver {
    @Query(() => UserResponse)
    async getUserById(@Arg("userId") userId: number): Promise<UserResponse> {
        const user = await UserUtils.getUserById(userId);
        return { user, success: !!user };
    }

    @Query(() => UserResponse)
    async searchUserByEmail(
        @Arg("email") email: string
    ): Promise<UserResponse> {
        const user = await UserUtils.searchUserByEmail(email);
        return { user, success: !!user };
    }

    @Mutation(() => UserResponse)
    async createUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Arg("roleId") roleId: number,
        @Arg("user_address", { nullable: true }) user_address: string,
        @Ctx() { req, res }: MyContext
    ): Promise<UserResponse> {
        const user = await UserUtils.createUser(name, email, password, roleId, user_address);
        return { user, success: !!user };
    }
    
    @Mutation(() => Boolean)
    async updateUser(
        @Arg("userId") userId: number,
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("roleId") roleId: number,
        @Arg("user_address", { nullable: true }) user_address: string,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        
    
        const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1TaGlJRjBKamlxTmlPVVdXaWxYTSJ9.eyJpc3MiOiJodHRwczovL2Rldi1pa2R1NTBtcTNvdWZ5bXdtLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJPM2FNNE5ERTl1SWJuYmludmxDWnNtR1o4VHlwaDVTU0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtaWtkdTUwbXEzb3VmeW13bS5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTcyNjc2MzM2NywiZXhwIjoxNzI5MzU1MzY3LCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIHJlYWQ6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgZGVsZXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl90aWNrZXRzIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6Y29ubmVjdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zIGRlbGV0ZTpjb25uZWN0aW9ucyBjcmVhdGU6Y29ubmVjdGlvbnMgcmVhZDpyZXNvdXJjZV9zZXJ2ZXJzIHVwZGF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGRlbGV0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGNyZWF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIHJlYWQ6ZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmRldmljZV9jcmVkZW50aWFscyBjcmVhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIHJlYWQ6cnVsZXMgdXBkYXRlOnJ1bGVzIGRlbGV0ZTpydWxlcyBjcmVhdGU6cnVsZXMgcmVhZDpydWxlc19jb25maWdzIHVwZGF0ZTpydWxlc19jb25maWdzIGRlbGV0ZTpydWxlc19jb25maWdzIHJlYWQ6aG9va3MgdXBkYXRlOmhvb2tzIGRlbGV0ZTpob29rcyBjcmVhdGU6aG9va3MgcmVhZDphY3Rpb25zIHVwZGF0ZTphY3Rpb25zIGRlbGV0ZTphY3Rpb25zIGNyZWF0ZTphY3Rpb25zIHJlYWQ6ZW1haWxfcHJvdmlkZXIgdXBkYXRlOmVtYWlsX3Byb3ZpZGVyIGRlbGV0ZTplbWFpbF9wcm92aWRlciBjcmVhdGU6ZW1haWxfcHJvdmlkZXIgYmxhY2tsaXN0OnRva2VucyByZWFkOnN0YXRzIHJlYWQ6aW5zaWdodHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpsb2dzX3VzZXJzIHJlYWQ6c2hpZWxkcyBjcmVhdGU6c2hpZWxkcyB1cGRhdGU6c2hpZWxkcyBkZWxldGU6c2hpZWxkcyByZWFkOmFub21hbHlfYmxvY2tzIGRlbGV0ZTphbm9tYWx5X2Jsb2NrcyB1cGRhdGU6dHJpZ2dlcnMgcmVhZDp0cmlnZ2VycyByZWFkOmdyYW50cyBkZWxldGU6Z3JhbnRzIHJlYWQ6Z3VhcmRpYW5fZmFjdG9ycyB1cGRhdGU6Z3VhcmRpYW5fZmFjdG9ycyByZWFkOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGRlbGV0ZTpndWFyZGlhbl9lbnJvbGxtZW50cyBjcmVhdGU6Z3VhcmRpYW5fZW5yb2xsbWVudF90aWNrZXRzIHJlYWQ6dXNlcl9pZHBfdG9rZW5zIGNyZWF0ZTpwYXNzd29yZHNfY2hlY2tpbmdfam9iIGRlbGV0ZTpwYXNzd29yZHNfY2hlY2tpbmdfam9iIHJlYWQ6Y3VzdG9tX2RvbWFpbnMgZGVsZXRlOmN1c3RvbV9kb21haW5zIGNyZWF0ZTpjdXN0b21fZG9tYWlucyB1cGRhdGU6Y3VzdG9tX2RvbWFpbnMgcmVhZDplbWFpbF90ZW1wbGF0ZXMgY3JlYXRlOmVtYWlsX3RlbXBsYXRlcyB1cGRhdGU6ZW1haWxfdGVtcGxhdGVzIHJlYWQ6bWZhX3BvbGljaWVzIHVwZGF0ZTptZmFfcG9saWNpZXMgcmVhZDpyb2xlcyBjcmVhdGU6cm9sZXMgZGVsZXRlOnJvbGVzIHVwZGF0ZTpyb2xlcyByZWFkOnByb21wdHMgdXBkYXRlOnByb21wdHMgcmVhZDpicmFuZGluZyB1cGRhdGU6YnJhbmRpbmcgZGVsZXRlOmJyYW5kaW5nIHJlYWQ6bG9nX3N0cmVhbXMgY3JlYXRlOmxvZ19zdHJlYW1zIGRlbGV0ZTpsb2dfc3RyZWFtcyB1cGRhdGU6bG9nX3N0cmVhbXMgY3JlYXRlOnNpZ25pbmdfa2V5cyByZWFkOnNpZ25pbmdfa2V5cyB1cGRhdGU6c2lnbmluZ19rZXlzIHJlYWQ6bGltaXRzIHVwZGF0ZTpsaW1pdHMgY3JlYXRlOnJvbGVfbWVtYmVycyByZWFkOnJvbGVfbWVtYmVycyBkZWxldGU6cm9sZV9tZW1iZXJzIHJlYWQ6ZW50aXRsZW1lbnRzIHJlYWQ6YXR0YWNrX3Byb3RlY3Rpb24gdXBkYXRlOmF0dGFja19wcm90ZWN0aW9uIHJlYWQ6b3JnYW5pemF0aW9uc19zdW1tYXJ5IGNyZWF0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIHJlYWQ6YXV0aGVudGljYXRpb25fbWV0aG9kcyB1cGRhdGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyBkZWxldGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpzY2ltX2NvbmZpZyBjcmVhdGU6c2NpbV9jb25maWcgdXBkYXRlOnNjaW1fY29uZmlnIGRlbGV0ZTpzY2ltX2NvbmZpZyBjcmVhdGU6c2NpbV90b2tlbiByZWFkOnNjaW1fdG9rZW4gZGVsZXRlOnNjaW1fdG9rZW4gZGVsZXRlOnBob25lX3Byb3ZpZGVycyBjcmVhdGU6cGhvbmVfcHJvdmlkZXJzIHJlYWQ6cGhvbmVfcHJvdmlkZXJzIHVwZGF0ZTpwaG9uZV9wcm92aWRlcnMgZGVsZXRlOnBob25lX3RlbXBsYXRlcyBjcmVhdGU6cGhvbmVfdGVtcGxhdGVzIHJlYWQ6cGhvbmVfdGVtcGxhdGVzIHVwZGF0ZTpwaG9uZV90ZW1wbGF0ZXMgY3JlYXRlOmVuY3J5cHRpb25fa2V5cyByZWFkOmVuY3J5cHRpb25fa2V5cyB1cGRhdGU6ZW5jcnlwdGlvbl9rZXlzIGRlbGV0ZTplbmNyeXB0aW9uX2tleXMgcmVhZDpzZXNzaW9ucyBkZWxldGU6c2Vzc2lvbnMgcmVhZDpyZWZyZXNoX3Rva2VucyBkZWxldGU6cmVmcmVzaF90b2tlbnMgY3JlYXRlOnNlbGZfc2VydmljZV9wcm9maWxlcyByZWFkOnNlbGZfc2VydmljZV9wcm9maWxlcyB1cGRhdGU6c2VsZl9zZXJ2aWNlX3Byb2ZpbGVzIGRlbGV0ZTpzZWxmX3NlcnZpY2VfcHJvZmlsZXMgY3JlYXRlOnNzb19hY2Nlc3NfdGlja2V0cyByZWFkOmZvcm1zIHVwZGF0ZTpmb3JtcyBkZWxldGU6Zm9ybXMgY3JlYXRlOmZvcm1zIHJlYWQ6Zmxvd3MgdXBkYXRlOmZsb3dzIGRlbGV0ZTpmbG93cyBjcmVhdGU6Zmxvd3MgcmVhZDpmbG93c192YXVsdCByZWFkOmZsb3dzX3ZhdWx0X2Nvbm5lY3Rpb25zIHVwZGF0ZTpmbG93c192YXVsdF9jb25uZWN0aW9ucyBkZWxldGU6Zmxvd3NfdmF1bHRfY29ubmVjdGlvbnMgY3JlYXRlOmZsb3dzX3ZhdWx0X2Nvbm5lY3Rpb25zIHJlYWQ6Zmxvd3NfZXhlY3V0aW9ucyBkZWxldGU6Zmxvd3NfZXhlY3V0aW9ucyByZWFkOmNvbm5lY3Rpb25zX29wdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zX29wdGlvbnMgcmVhZDpjbGllbnRfY3JlZGVudGlhbHMgY3JlYXRlOmNsaWVudF9jcmVkZW50aWFscyB1cGRhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIGRlbGV0ZTpjbGllbnRfY3JlZGVudGlhbHMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJPM2FNNE5ERTl1SWJuYmludmxDWnNtR1o4VHlwaDVTUyJ9.LzK4jjqP7cTezyjdik-AFRAOMrA9ZqQj00PXzgswyaXV3dZ3xU8qnUz-jVrNfgyWAfYFg0rxlGElsmNKmYSAJSrE5Nj9S7sy4xN559w3FJqjeJT2iqutOD1__KwC2z14thXHIkGxtxlAIJ97V-tvPFsb0gFd8bY5RttoyDxPdJIrw5NaLsgIOlBNE4B_vEkJUszMCkD-TYcRSGU1zQqft6iLs4j8vnVYIfJe3N8HS5j6KbEbvmgEs0-bakRW6Ri-qQVhIcb7DVQitDGYMVhq4alD6swaMhijshomxr5IHem6SD37MNk0Gou8Ti1QOjSRHV3qFwW58Ka22hp40KlSRQ'
    
        try {
            // Step 1: Fetch the user from your local database
            const user = await UserUtils.getUserById(userId);
            if (!user) {
                throw new Error("User not found.");
            }
    
            // Step 2: Retrieve the user from Auth0 by email
            const auth0Response = await axios.get(
                `https://dev-ikdu50mq3oufymwm.eu.auth0.com/api/v2/users-by-email?email=${user.email}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Auth0 token from frontend
                    },
                }
            );
    
            const auth0User = auth0Response.data[0];
            if (!auth0User || !auth0User.user_id) {
                throw new Error("User not found in Auth0.");
            }
    
            // Step 3: Update the user in Auth0
            const auth0UpdateResponse = await axios.patch(
                `https://dev-ikdu50mq3oufymwm.eu.auth0.com/api/v2/users/${auth0User.user_id}`,
                {
                    name, // Update name in Auth0
                    email, // Optionally update email in Auth0
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Auth0 token from frontend
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            if (auth0UpdateResponse.status !== 200) {
                throw new Error("Failed to update user in Auth0.");
            }
    
            // Step 4: Proceed with local database update
            await UserUtils.updateUser(userId, name, email, roleId, user_address);
    
            return true;
        } catch (error) {
            console.error("Error during user update:", error);
            throw new Error("Update failed.");
        }
    }
    
    @Mutation(() => Boolean)
    async deleteUser(
        @Arg("userId") userId: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        // Use your saved token instead of fetching from request headers
        const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1TaGlJRjBKamlxTmlPVVdXaWxYTSJ9.eyJpc3MiOiJodHRwczovL2Rldi1pa2R1NTBtcTNvdWZ5bXdtLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJPM2FNNE5ERTl1SWJuYmludmxDWnNtR1o4VHlwaDVTU0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtaWtkdTUwbXEzb3VmeW13bS5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTcyNjc2MzM2NywiZXhwIjoxNzI5MzU1MzY3LCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIHJlYWQ6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgZGVsZXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl90aWNrZXRzIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6Y29ubmVjdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zIGRlbGV0ZTpjb25uZWN0aW9ucyBjcmVhdGU6Y29ubmVjdGlvbnMgcmVhZDpyZXNvdXJjZV9zZXJ2ZXJzIHVwZGF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGRlbGV0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGNyZWF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIHJlYWQ6ZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmRldmljZV9jcmVkZW50aWFscyBjcmVhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIHJlYWQ6cnVsZXMgdXBkYXRlOnJ1bGVzIGRlbGV0ZTpydWxlcyBjcmVhdGU6cnVsZXMgcmVhZDpydWxlc19jb25maWdzIHVwZGF0ZTpydWxlc19jb25maWdzIGRlbGV0ZTpydWxlc19jb25maWdzIHJlYWQ6aG9va3MgdXBkYXRlOmhvb2tzIGRlbGV0ZTpob29rcyBjcmVhdGU6aG9va3MgcmVhZDphY3Rpb25zIHVwZGF0ZTphY3Rpb25zIGRlbGV0ZTphY3Rpb25zIGNyZWF0ZTphY3Rpb25zIHJlYWQ6ZW1haWxfcHJvdmlkZXIgdXBkYXRlOmVtYWlsX3Byb3ZpZGVyIGRlbGV0ZTplbWFpbF9wcm92aWRlciBjcmVhdGU6ZW1haWxfcHJvdmlkZXIgYmxhY2tsaXN0OnRva2VucyByZWFkOnN0YXRzIHJlYWQ6aW5zaWdodHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpsb2dzX3VzZXJzIHJlYWQ6c2hpZWxkcyBjcmVhdGU6c2hpZWxkcyB1cGRhdGU6c2hpZWxkcyBkZWxldGU6c2hpZWxkcyByZWFkOmFub21hbHlfYmxvY2tzIGRlbGV0ZTphbm9tYWx5X2Jsb2NrcyB1cGRhdGU6dHJpZ2dlcnMgcmVhZDp0cmlnZ2VycyByZWFkOmdyYW50cyBkZWxldGU6Z3JhbnRzIHJlYWQ6Z3VhcmRpYW5fZmFjdG9ycyB1cGRhdGU6Z3VhcmRpYW5fZmFjdG9ycyByZWFkOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGRlbGV0ZTpndWFyZGlhbl9lbnJvbGxtZW50cyBjcmVhdGU6Z3VhcmRpYW5fZW5yb2xsbWVudF90aWNrZXRzIHJlYWQ6dXNlcl9pZHBfdG9rZW5zIGNyZWF0ZTpwYXNzd29yZHNfY2hlY2tpbmdfam9iIGRlbGV0ZTpwYXNzd29yZHNfY2hlY2tpbmdfam9iIHJlYWQ6Y3VzdG9tX2RvbWFpbnMgZGVsZXRlOmN1c3RvbV9kb21haW5zIGNyZWF0ZTpjdXN0b21fZG9tYWlucyB1cGRhdGU6Y3VzdG9tX2RvbWFpbnMgcmVhZDplbWFpbF90ZW1wbGF0ZXMgY3JlYXRlOmVtYWlsX3RlbXBsYXRlcyB1cGRhdGU6ZW1haWxfdGVtcGxhdGVzIHJlYWQ6bWZhX3BvbGljaWVzIHVwZGF0ZTptZmFfcG9saWNpZXMgcmVhZDpyb2xlcyBjcmVhdGU6cm9sZXMgZGVsZXRlOnJvbGVzIHVwZGF0ZTpyb2xlcyByZWFkOnByb21wdHMgdXBkYXRlOnByb21wdHMgcmVhZDpicmFuZGluZyB1cGRhdGU6YnJhbmRpbmcgZGVsZXRlOmJyYW5kaW5nIHJlYWQ6bG9nX3N0cmVhbXMgY3JlYXRlOmxvZ19zdHJlYW1zIGRlbGV0ZTpsb2dfc3RyZWFtcyB1cGRhdGU6bG9nX3N0cmVhbXMgY3JlYXRlOnNpZ25pbmdfa2V5cyByZWFkOnNpZ25pbmdfa2V5cyB1cGRhdGU6c2lnbmluZ19rZXlzIHJlYWQ6bGltaXRzIHVwZGF0ZTpsaW1pdHMgY3JlYXRlOnJvbGVfbWVtYmVycyByZWFkOnJvbGVfbWVtYmVycyBkZWxldGU6cm9sZV9tZW1iZXJzIHJlYWQ6ZW50aXRsZW1lbnRzIHJlYWQ6YXR0YWNrX3Byb3RlY3Rpb24gdXBkYXRlOmF0dGFja19wcm90ZWN0aW9uIHJlYWQ6b3JnYW5pemF0aW9uc19zdW1tYXJ5IGNyZWF0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIHJlYWQ6YXV0aGVudGljYXRpb25fbWV0aG9kcyB1cGRhdGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyBkZWxldGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpzY2ltX2NvbmZpZyBjcmVhdGU6c2NpbV9jb25maWcgdXBkYXRlOnNjaW1fY29uZmlnIGRlbGV0ZTpzY2ltX2NvbmZpZyBjcmVhdGU6c2NpbV90b2tlbiByZWFkOnNjaW1fdG9rZW4gZGVsZXRlOnNjaW1fdG9rZW4gZGVsZXRlOnBob25lX3Byb3ZpZGVycyBjcmVhdGU6cGhvbmVfcHJvdmlkZXJzIHJlYWQ6cGhvbmVfcHJvdmlkZXJzIHVwZGF0ZTpwaG9uZV9wcm92aWRlcnMgZGVsZXRlOnBob25lX3RlbXBsYXRlcyBjcmVhdGU6cGhvbmVfdGVtcGxhdGVzIHJlYWQ6cGhvbmVfdGVtcGxhdGVzIHVwZGF0ZTpwaG9uZV90ZW1wbGF0ZXMgY3JlYXRlOmVuY3J5cHRpb25fa2V5cyByZWFkOmVuY3J5cHRpb25fa2V5cyB1cGRhdGU6ZW5jcnlwdGlvbl9rZXlzIGRlbGV0ZTplbmNyeXB0aW9uX2tleXMgcmVhZDpzZXNzaW9ucyBkZWxldGU6c2Vzc2lvbnMgcmVhZDpyZWZyZXNoX3Rva2VucyBkZWxldGU6cmVmcmVzaF90b2tlbnMgY3JlYXRlOnNlbGZfc2VydmljZV9wcm9maWxlcyByZWFkOnNlbGZfc2VydmljZV9wcm9maWxlcyB1cGRhdGU6c2VsZl9zZXJ2aWNlX3Byb2ZpbGVzIGRlbGV0ZTpzZWxmX3NlcnZpY2VfcHJvZmlsZXMgY3JlYXRlOnNzb19hY2Nlc3NfdGlja2V0cyByZWFkOmZvcm1zIHVwZGF0ZTpmb3JtcyBkZWxldGU6Zm9ybXMgY3JlYXRlOmZvcm1zIHJlYWQ6Zmxvd3MgdXBkYXRlOmZsb3dzIGRlbGV0ZTpmbG93cyBjcmVhdGU6Zmxvd3MgcmVhZDpmbG93c192YXVsdCByZWFkOmZsb3dzX3ZhdWx0X2Nvbm5lY3Rpb25zIHVwZGF0ZTpmbG93c192YXVsdF9jb25uZWN0aW9ucyBkZWxldGU6Zmxvd3NfdmF1bHRfY29ubmVjdGlvbnMgY3JlYXRlOmZsb3dzX3ZhdWx0X2Nvbm5lY3Rpb25zIHJlYWQ6Zmxvd3NfZXhlY3V0aW9ucyBkZWxldGU6Zmxvd3NfZXhlY3V0aW9ucyByZWFkOmNvbm5lY3Rpb25zX29wdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zX29wdGlvbnMgcmVhZDpjbGllbnRfY3JlZGVudGlhbHMgY3JlYXRlOmNsaWVudF9jcmVkZW50aWFscyB1cGRhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIGRlbGV0ZTpjbGllbnRfY3JlZGVudGlhbHMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJPM2FNNE5ERTl1SWJuYmludmxDWnNtR1o4VHlwaDVTUyJ9.LzK4jjqP7cTezyjdik-AFRAOMrA9ZqQj00PXzgswyaXV3dZ3xU8qnUz-jVrNfgyWAfYFg0rxlGElsmNKmYSAJSrE5Nj9S7sy4xN559w3FJqjeJT2iqutOD1__KwC2z14thXHIkGxtxlAIJ97V-tvPFsb0gFd8bY5RttoyDxPdJIrw5NaLsgIOlBNE4B_vEkJUszMCkD-TYcRSGU1zQqft6iLs4j8vnVYIfJe3N8HS5j6KbEbvmgEs0-bakRW6Ri-qQVhIcb7DVQitDGYMVhq4alD6swaMhijshomxr5IHem6SD37MNk0Gou8Ti1QOjSRHV3qFwW58Ka22hp40KlSRQ'; // Replace this with the token from your screenshot
    
        try {
            // Step 1: Fetch the user from your local database
            const user = await UserUtils.getUserById(userId);
            if (!user) {
                throw new Error("User not found.");
            }
    
            // Step 2: Retrieve the Auth0 user by email
            const auth0Response = await axios.get(
                `https://dev-ikdu50mq3oufymwm.eu.auth0.com/api/v2/users-by-email?email=${user.email}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Use the token here
                    },
                }
            );
    
            const auth0User = auth0Response.data[0];
            if (!auth0User || !auth0User.user_id) {
                throw new Error("User not found in Auth0.");
            }
    
            // Step 3: Delete the user from Auth0
            const auth0DeleteResponse = await axios.delete(
                `https://dev-ikdu50mq3oufymwm.eu.auth0.com/api/v2/users/${auth0User.user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Use the token here again
                    },
                }
            );
    
            if (auth0DeleteResponse.status !== 204) {
                throw new Error("Failed to delete user from Auth0.");
            }
    
            // Step 4: Proceed with local database deletion
            await UserUtils.deleteUser(userId);
    
            return true;
        } catch (error) {
            console.error("Error during user deletion:", error);
            throw new Error("Deletion failed.");
        }
    }
    
    

    @Mutation(() => Boolean)
    async assignUserToShop(
        @Arg("userId") userId: number,
        @Arg("shopId") shopId: number,
        @Arg("roleId") roleId: number
    ): Promise<boolean> {
        return await UserUtils.assignUserToShop(userId, shopId, roleId);
    }

    @Query(() => Role, { nullable: true })
    async getUserRole(@Arg("userId") userId: number): Promise<Role | null> {
        return await UserUtils.getUserRole(userId);
    }

    @Query(() => [Shop])
    async getUserShops(@Arg("userId") userId: number): Promise<Shop[]> {
        return await UserUtils.getUserShops(userId);
    }

    @Query(() => Number, { nullable: true })
    async getUserShopId(@Arg("userId") userId: number): Promise<number | null> {
        return await UserUtils.getUserShopId(userId);
    }

    @Query(() => String, { nullable: true })
    async getUserAddress(@Arg('userId') userId: number): Promise<string | null> {
    return await UserUtils.getUserAddress(userId);
    }

    @Mutation(() => UserResponse)
    async loginWithEmailPassword(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<UserResponse> {
        try {
            // Call Auth0 API to login
            const response = await axios.post(
                "https://dev-ikdu50mq3oufymwm.eu.auth0.com/oauth/token",
                {
                    grant_type: "password",
                    client_id: "g8bZZsV43dHDoB0B0yRHRbX9CHnQxDLb",
                    client_secret:
                        "P8xBywmxOTMNQyvYBkujsAroLLzLs6P0URh2sr2hK9wgO5KIoodM_0MM2WvfG15X",
                    username: email,
                    password: password,
                    audience: "",
                    connection: "Username-Password-Authentication",
                    scope: "openid profile email",
                }
            );

            const { id_token } = response.data;

            // Decode the token to get user information
            const decodedToken = JSON.parse(
                Buffer.from(id_token.split(".")[1], "base64").toString()
            );

            // Fetch or create user in your own database based on the email
            const user = await UserUtils.searchUserByEmail(decodedToken.email);

            if (!user) {
                throw new Error("User not found in the Apollo database");
            }

            return {
                user,
                success: !!user,
                token: id_token,
            };
        } catch (error) {
            console.error("Error during Auth0 authentication:", error);
            throw new Error("Login failed.");
        }
    }
    
    @Mutation(() => UserResponse)
    async registerWithEmailPassword(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Arg("roleId") roleId: number,
        @Arg("user_address") user_address: string,
        @Ctx() { req, res }: MyContext
    ): Promise<UserResponse> {
        try {
            const auth0SignupResponse = await axios.post(
                "https://dev-ikdu50mq3oufymwm.eu.auth0.com/dbconnections/signup",
                {
                    client_id: "g8bZZsV43dHDoB0B0yRHRbX9CHnQxDLb",
                    email: email,
                    password: password,
                    connection: "Username-Password-Authentication",
                }
            );

            if (auth0SignupResponse.status !== 200) {
                console.error(
                    "Error registering user with Auth0:",
                    auth0SignupResponse.data
                );
                throw new Error("Error registering with Auth0.");
            }

            const tokenResponse = await axios.post(
                "https://dev-ikdu50mq3oufymwm.eu.auth0.com/oauth/token",
                {
                    grant_type: "password",
                    client_id: "g8bZZsV43dHDoB0B0yRHRbX9CHnQxDLb",
                    client_secret:
                        "P8xBywmxOTMNQyvYBkujsAroLLzLs6P0URh2sr2hK9wgO5KIoodM_0MM2WvfG15X",
                    username: email,
                    password: password,
                    scope: "openid profile email",
                    audience: "",
                }
            );

            if (tokenResponse.status !== 200) {
                console.error(
                    "Error retrieving token from Auth0:",
                    tokenResponse.data
                );
                throw new Error("Error retrieving token from Auth0.");
            }

            const { id_token } = tokenResponse.data;

            const decodedToken = JSON.parse(
                Buffer.from(id_token.split(".")[1], "base64").toString()
            );
            const emailFromToken = decodedToken.email;

            if (!emailFromToken) {
                console.error("Failed to retrieve email from Auth0 token.");
                throw new Error("Email not found in Auth0 token.");
            }

            const newUser = await UserUtils.createUser(
                name,
                email,
                password,
                roleId,
                user_address
            );

            if (!newUser) {
                console.error("Error creating user in Apollo database.");
                throw new Error("User creation failed in Apollo.");
            }

            return {
                user: newUser,
                success: true,
                token: id_token,
            };
        } catch (error) {
            console.error(
                "Error during user registration:",
                error.response?.data || error.message || error
            );
            throw new Error("Registration failed.");
        }
    }
}

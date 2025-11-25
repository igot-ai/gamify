export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: 'game_designer' | 'lead_designer' | 'product_manager' | 'admin';
}

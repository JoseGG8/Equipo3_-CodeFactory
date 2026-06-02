import java.sql.*;
try {
    String url = "jdbc:postgresql://localhost:5432/Gestion_Finanzas?sslmode=require";
    String user = "JoseGG8";
    String pass = "admin";
    try (Connection conn = DriverManager.getConnection(url, user, pass);
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery("SELECT id, nombre, email, rol FROM users ORDER BY id LIMIT 20")) {
        while (rs.next()) {
            System.out.println(rs.getLong("id") + "|" + rs.getString("nombre") + "|" + rs.getString("email") + "|" + rs.getString("rol"));
        }
    }
} catch (Exception e) {
    e.printStackTrace();
}

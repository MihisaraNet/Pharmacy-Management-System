+------------------------------------+
|         com.example.pharmacy       |
+------------------------------------+
|                                    |
|                                    |
|                                    |
+------------------------------------+
         |              |                            |
       Config      Security                     Controller
         |              |                            |
--------------------------------   -------------------------------
| SecurityConfig   | JwtAuthFilter  | AuthController          |
|                  | JwtUtil        | MedicineController      |
                  DTO                      SaleController
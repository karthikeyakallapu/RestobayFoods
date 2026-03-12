import { pool } from "../config/database.js";

class MenuController {
  async getMenu(req, res) {
    try {
      const [menu] = await pool.query("SELECT * FROM MENU");
      const categories = [...new Set(menu.map((item) => item.category))];
      res.status(200).json({
        type: "success",
        menu,
        categories,
      });
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({
        type: "error",
        message: "Internal server error",
      });
    }
  }
}

const menuController = new MenuController();

export default menuController;

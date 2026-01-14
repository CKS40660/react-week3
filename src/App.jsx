import axios from "axios";
import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

// env 變數不要加""及;
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

// 宣告
const emptyProduct = {
  id: "",
  title: "",
  category: "",
  content: "",
  description: "",
  imageUrl: "",
  imagesUrl: [],
  price: 0,
  origin_price: 0,
  unit: "元",
  is_enabled: 0,
};

function App() {
  // 解構 useState 回傳的結果：formData 是目前的資料狀態，setFormData 是更新formData的方法(function)，useState 內的值是預設資料狀態
  // 要記得post 內的參數要和後端 API 規定的欄位名稱相同
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  // 第二層資料modal
  const [tempProduct, setTempProduct] = useState(null);
  const handleOpenModal = (product) => {
    setTempProduct(product);
  };

  const getData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // 不要留console.log在正式環境
      // console.log("產品資料：", response.data);
      setProducts(response.data.products);
    } catch (err) {
      console.error("取得產品失敗：", err.response?.data?.message);
    }
  };

  function Card({ product, onOpenModal }) {
    const { title, imageUrl, description, origin_price, price } = product;
    return (
      <div className="col">
        <div className="card" style={{ height: "100%" }}>
          <img src={imageUrl} className="card-img-top" alt={title} />
          <div className="card-body">
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{description}</p>
            <div className="d-flex ">
              <p className="me-auto">
                價格：
                <del>
                  <small>{origin_price}</small>
                </del>{" "}
                {price} 元
              </p>
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#productModal"
                onClick={() => onOpenModal(product)}
              >
                詳細資訊
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 輸入表單驗證登入
  async function formSubmit(event) {
    // 阻止預設行為，防止跳轉頁面
    event.preventDefault();
    try {
      // axios.post(url, data, config) 第二個data是傳送的資料，即帳號密碼
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      // 將 token 寫入 cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = `${token}`;
      setIsAuth(true);
      // 拿到產品資料
      getData();
      // alert("登入成功");
    } catch (err) {
      alert("請重新登入");
    }
  }

  // btn新增功能
  async function handleAdd() {
    try {
      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/product`,
        { data: tempProduct }
      );
      getData();
    } catch (error) {}
  }

  // btn編輯功能
  async function handleEdit(product) {
    try {
      const response = await axios.put(
        `${API_BASE}/api/${API_PATH}/admin/product/${product.id}`,
        { data: product }
      );
      console.log(product);
      getData();
    } catch (error) {
      console.error(error);
    }
  }

  // btn刪除功能
  async function handleDelete(product) {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${product.id}`
      );
      getData();
    } catch (error) {
      console.error(error);
    }
  }

  // 寫檢查登入函式
  const checkLogin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      // 變更權限
      setIsAuth(true);
      // 抓取產品資料
      getData();
    } catch (err) {
      console.log("權限檢查失敗：", err.response?.data?.message);
      setIsAuth(false);
    }
  };

  // 讓重整確認token不會重登
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    checkLogin();
  }, []);

  return (
    <>
      {isAuth ? (
        <div className="container-fluid">
          <h1>商品賣場</h1>
          <div className="d-flex mb-2">
            <button
              className="btn btn-success ms-auto"
              data-bs-toggle="modal"
              data-bs-target="#addForm"
              onClick={() => {
                setTempProduct(emptyProduct);
              }}
            >
              新增產品
            </button>
            {/* modal */}
            <div
              className="modal fade  "
              id="addForm"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="addForm"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addFormLabel">
                      新增產品
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body d-flex">
                    <div className="mb-3 me-4 text-start">
                      <label htmlFor="inputUrl" className="form-label">
                        主圖<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="inputUrl"
                        required
                      />
                    </div>
                    <form className="text-start">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                          商品名稱 <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="inputTitle"
                          aria-describedby="titleHelp"
                          value={tempProduct?.title || ""}
                          onChange={(e) =>
                            setTempProduct({
                              ...tempProduct,
                              title: e.target.value,
                            })
                          }
                        />
                        <div id="titleHelp" className="form-text" required>
                          格式 [買/賣]商品名稱
                        </div>
                      </div>
                      <label htmlFor="title" className="select-label">
                        商品類別 <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select mb-3"
                        aria-label="Default select category"
                        required
                      >
                        <option selected></option>
                        <option value="Pitcher">投手</option>
                        <option value="Hitter">野手</option>
                        <option value="AllStar">明星</option>
                        <option value="Rookie">新秀</option>
                      </select>
                      <div className="mb-3">
                        <label htmlFor="inputContent" className="form-label">
                          商品內容
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="inputContent"
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="inputDescription"
                          className="form-label"
                        >
                          商品敘述
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="inputDescription"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="inputPrice" className="form-label">
                          價格<span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="inputPrice"
                          required
                        />
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer d-flex justify-content-between">
                    <p>
                      <span className="text-danger">*</span>為必填項目
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                      onClick={handleAdd}
                    >
                      新增
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row row-cols-2 g-4">
            {products.map((product) => (
              // Card傳product資料
              <Card
                product={product}
                onOpenModal={handleOpenModal}
                key={product.id}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="container">
          {/* 三元只能回傳一個值，不能多排並列，註解也不能放在外面*/}
          <h1>登入</h1>
          <form className="text-start" onSubmit={formSubmit}>
            <div className="form-group">
              <label htmlFor="exampleInputEmail1">帳號</label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="E-mail"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value,
                  })
                }
                // 新增requied屬性，表單驗證必填
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputPassword1">密碼</label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                // 新增requied屬性，表單驗證必填
                required
              />
            </div>
            <div className="d-flex">
              <button type="submit" className="btn btn-primary ms-auto">
                {/* ms-auto要在d-flex下才有用 */}
                送出
              </button>
            </div>
          </form>
        </div>
      )}

      {
        // 從modal外層判斷tempProduct===null，初始化無法取得值
        <div
          className="modal fade "
          id="productModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* 改從內層判斷{tempProduct && ( ... )}，當前者為true會回傳後者，前者為false則不渲染 */}
              {tempProduct && (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">{tempProduct.title}</h5>
                    <span className="btn btn-primary btn-sm ms-3">
                      {tempProduct.category}
                    </span>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body text-start">
                    <p>{tempProduct.description} </p>
                    {tempProduct.imagesUrl.map((img, index) => {
                      return (
                        <img src={img} alt={tempProduct.title} key={index} />
                      );
                    })}
                    <p className="mt-2 mb-0">
                      {tempProduct.is_enabled
                        ? `庫存 1 ${tempProduct.unit}`
                        : "已售完"}
                    </p>
                    <p>
                      售價：
                      <span className="fw-bold fs-3">{tempProduct.price}</span>
                    </p>
                  </div>
                  <div className="modal-footer">
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleEdit(tempProduct)}
                        id={tempProduct.id}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(tempProduct)}
                        data-bs-dismiss="modal"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default App;

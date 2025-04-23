import bcrypt from 'bcrypt';
import Customer from '../models/Customer.js';
import { generateJwt } from '../helpers/token.js';
import { sendEmail } from '../helpers/email.js';

const buildCustomerResponse = (customer, token) => ({
  message: "Successo",
  token,
  customer: {
    id: customer._id,
    firstName: customer.firstName,
    email: customer.email,
    role: customer.role,
    profileImg: customer.profileImg,
    gender : customer.gender,
  },
});

// REGISTRAZIONE
export async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e password sono obbligatori" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "L'email è già registrata" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const profileImg = req.file?.path || null;
    const cloudinaryId = req.file?.filename || null;

    const createdCustomer = await Customer.create({
      ...req.body,
      password: passwordHash,
      profileImg,
      cloudinaryId,
    });

    await sendEmail({
      to: createdCustomer.email,
      subject: '👋 Benvenuto su RoomBooker!',
      text: 'La tua registrazione è andata a buon fine.',
      html: `<h1>Ciao ${createdCustomer.firstName} 👋</h1><p>Grazie per esserti registrato su <strong>RoomBooker</strong>!</p>`
    });

    const token = await generateJwt({ customerId: createdCustomer._id });

    return res.status(201).json(buildCustomerResponse(createdCustomer, token));
  } catch (err) {
    console.error("❌ Errore nella registrazione:", err);
    return res.status(500).json({
      message: "Errore nella registrazione",
      error: err.message || "Errore sconosciuto"
    });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email e password sono obbligatori" });
    }

    const customer = await Customer.findOne({ email }).select("+password");
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({ message: "Credenziali errate" });
    }

    const token = await generateJwt({ customerId: customer._id });
    return res.status(200).json(buildCustomerResponse(customer, token));
  } catch (error) {
    console.error("❌ Errore login:", error);
    return res.status(500).json({
      message: "Errore durante il login",
      error: error.message || "Errore sconosciuto",
    });
  }
}

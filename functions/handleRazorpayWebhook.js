const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();
const WEBHOOK_SECRET = functions.config().razorpay.webhook_secret;

exports.handleRazorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const generatedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (razorpaySignature !== generatedSignature) {
      console.error("Signature verification failed");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    if (event === "payment.captured") {
      const userUID = payment.notes.userUID;
      const orderId = payment.order_id;

      await admin.firestore()
          .doc(
              "users/" +
              userUID +
              "/orders/" +
              orderId,
          )
          .set(
              {
                status: "paid",
                razorpayPaymentId: payment.id,
                amount: payment.amount / 100,
                currency: payment.currency,
                method: payment.method,
                paidAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              },
              {merge: true},
          );

      console.log("Updated Firestore for order " + orderId);
      return res.status(200)
          .send("Payment processed successfully");
    }

    return res.status(200).send("Event ignored");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal server error");
  }
});
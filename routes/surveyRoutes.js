const requireLogin = require('../middlewares/requireLogin')
const requireCredits = require('../middlewares/requireCredits')
const mongoose = require('mongoose')
const Survey = mongoose.model('surveys')
const surveyTemplate = require('../services/emailTemplate/surveyTemplate')

module.exports = (app, resend) => {
  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, from, recipients, subject, body } = req.body
    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients
        .split(',')
        .map((email) => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now()
    })
    try {
      const { data } = await resend.emails.send({
        from,
        to: recipients,
        subject,
        html: surveyTemplate(body)
      })

      await survey.save()
      req.user.credits -= 1
      const user = await req.user.save()
      res.status(200).json({ user, data })
    } catch (error) {
      return res.status(400).json({ error })
    }
  })
}

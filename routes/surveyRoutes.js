const requireLogin = require('../middlewares/requireLogin')
const requireCredits = require('../middlewares/requireCredits')
const surveyTemplate = require('../services/emailTemplate/surveyTemplate')

module.exports = (app, resend) => {
  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { from, to, subject, body } = req.body
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: surveyTemplate(body)
    })

    if (error) {
      return res.status(400).json({ error })
    }

    res.status(200).json({ data })
  })
}

import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, fillIn, blur, click, settled } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import graphqlError from "dummy/tests/helpers/graphql-error";

module("Integration | Component | cfb-form-editor/question", function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test("it renders", async function(assert) {
    assert.expect(3);

    this.server.create("question", {
      label: "Test Label",
      slug: "test-slug",
      type: "TEXT"
    });

    await render(hbs`{{cfb-form-editor/question slug='test-slug'}}`);

    assert.dom("[name=label]").hasValue("Test Label");
    assert.dom("[name=slug]").hasValue("test-slug");
    assert.dom("[name=slug]").isDisabled();
  });

  test("it validates", async function(assert) {
    assert.expect(2);

    this.server.create("question", {
      label: "Test Label",
      slug: "test-slug",
      type: "TEXT"
    });

    await render(hbs`{{cfb-form-editor/question slug='test-slug'}}`);

    await fillIn("[name=label]", "");
    await blur("[name=label]");

    assert.dom("button[type=submit]").isDisabled();
    assert.dom("[name=label] + span").hasText("Label can't be blank");
  });

  test("it can edit a question", async function(assert) {
    assert.expect(4);

    this.server.create("question", {
      label: "Test Label",
      slug: "test-slug",
      type: "TEXT"
    });

    this.set("afterSubmit", question => {
      assert.ok(question);
      assert.equal(question.label, "Test Label 1");
      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question slug='test-slug' on-after-submit=(action afterSubmit)}}`
    );

    await fillIn("[name=label]", "Test Label 1");

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it can handle errors", async function(assert) {
    assert.expect(1);

    this.server.create("question", { slug: "test-slug" });

    this.set("afterSubmit", () => assert.step("after-submit"));

    // edit question
    await render(
      hbs`{{cfb-form-editor/question
        slug='test-slug'
        on-after-submit=(action afterSubmit)
      }}`
    );

    this.server.post("/graphql", () => graphqlError("saveQuestion"), 200);
    // We need to add a change to enable the submit button
    await fillIn("input[name=label]", "Test");
    await click("button[type=submit]");

    assert.verifySteps([]);
  });

  test("it can handle 404 errors", async function(assert) {
    assert.expect(1);

    this.server.post("/graphql", () => ({
      data: { allQuestions: { edges: [], __typename: "QuestionEdges" } }
    }));

    await render(hbs`{{cfb-form-editor/question slug='test-slug'}}`);

    assert.dom("p").hasText("No question with slug 'test-slug' found");
  });

  test("it suggests a slug", async function(assert) {
    assert.expect(1);

    await render(hbs`{{cfb-form-editor/question slug=null}}`);

    await fillIn("input[name=label]", "Test Label 123");

    assert.dom("input[name=slug]").hasValue("test-label-123");
  });

  test("it can create a text question", async function(assert) {
    assert.expect(6);

    this.server.create("form", { slug: "test-form" });

    this.set("afterSubmit", question => {
      assert.equal(question.__typename, "TextQuestion");
      assert.equal(question.label, "Label");
      assert.equal(question.slug, "slug");
      assert.equal(question.maxLength, 20);

      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question form='test-form' on-after-submit=(action afterSubmit)}}`
    );

    await click("[data-test-type=TextQuestion]");
    await fillIn("[name=label]", "Label");
    await fillIn("[name=slug]", "slug");
    await fillIn("[name=maxLength]", 20);

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it can create a textarea question", async function(assert) {
    assert.expect(6);

    this.server.create("form", { slug: "test-form" });

    this.set("afterSubmit", question => {
      assert.equal(question.__typename, "TextareaQuestion");
      assert.equal(question.label, "Label");
      assert.equal(question.slug, "slug");
      assert.equal(question.maxLength, 20);

      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question form='test-form' on-after-submit=(action afterSubmit)}}`
    );

    await click("[data-test-type=TextareaQuestion]");
    await fillIn("[name=label]", "Label");
    await fillIn("[name=slug]", "slug");
    await fillIn("[name=maxLength]", 20);

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it can create an integer question", async function(assert) {
    assert.expect(7);

    this.server.create("form", { slug: "test-form" });

    this.set("afterSubmit", question => {
      assert.equal(question.__typename, "IntegerQuestion");
      assert.equal(question.label, "Label");
      assert.equal(question.slug, "slug");
      assert.equal(question.integerMinValue, -20);
      assert.equal(question.integerMaxValue, 20);

      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question form='test-form' on-after-submit=(action afterSubmit)}}`
    );

    await click("[data-test-type=IntegerQuestion]");
    await fillIn("[name=label]", "Label");
    await fillIn("[name=slug]", "slug");
    await fillIn("[name=integerMinValue]", -20);
    await fillIn("[name=integerMaxValue]", 20);

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it can create a float question", async function(assert) {
    assert.expect(7);

    this.server.create("form", { slug: "test-form" });

    this.set("afterSubmit", question => {
      assert.equal(question.__typename, "FloatQuestion");
      assert.equal(question.label, "Label");
      assert.equal(question.slug, "slug");
      assert.equal(question.floatMinValue, -20);
      assert.equal(question.floatMaxValue, 20);

      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question form='test-form' on-after-submit=(action afterSubmit)}}`
    );

    await click("[data-test-type=FloatQuestion]");
    await fillIn("[name=label]", "Label");
    await fillIn("[name=slug]", "slug");
    await fillIn("[name=floatMinValue]", -20);
    await fillIn("[name=floatMaxValue]", 20);

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it can create a checkbox question", async function(assert) {
    assert.expect(5);

    this.server.create("form", { slug: "test-form" });

    this.set("afterSubmit", question => {
      assert.equal(question.__typename, "CheckboxQuestion");
      assert.equal(question.label, "Label");
      assert.equal(question.slug, "slug");

      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question form='test-form' on-after-submit=(action afterSubmit)}}`
    );

    await click("[data-test-type=CheckboxQuestion]");
    await fillIn("[name=label]", "Label");
    await fillIn("[name=slug]", "slug");

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it can create a radio question", async function(assert) {
    assert.expect(5);

    this.server.create("form", { slug: "test-form" });

    this.set("afterSubmit", question => {
      assert.equal(question.__typename, "RadioQuestion");
      assert.equal(question.label, "Label");
      assert.equal(question.slug, "slug");

      assert.step("after-submit");
    });

    await render(
      hbs`{{cfb-form-editor/question form='test-form' on-after-submit=(action afterSubmit)}}`
    );

    await click("[data-test-type=RadioQuestion]");
    await fillIn("[name=label]", "Label");
    await fillIn("[name=slug]", "slug");

    await click("button[type=submit]");

    assert.verifySteps(["after-submit"]);
  });

  test("it validates the slug", async function(assert) {
    assert.expect(3);

    this.server.create("question", { slug: "test-slug" });
    this.server.create("question", { slug: "other-test-slug" });

    await render(hbs`{{cfb-form-editor/question slug=null}}`);

    await fillIn("input[name=slug]", "test-slug");
    await blur("input[name=slug]");
    await settled();

    assert
      .dom("input[name=slug] + span")
      .hasText("A question with this slug already exists");

    await fillIn("input[name=slug]", "valid-slug");
    await blur("input[name=slug]");
    await settled();

    assert.dom("input[name=slug] + span").doesNotExist();

    await fillIn("input[name=label]", "Other Test Slug");
    await blur("input[name=label]");
    await blur("input[name=slug]");
    await settled();

    assert
      .dom("input[name=slug] + span")
      .hasText("A question with this slug already exists");
  });
});
